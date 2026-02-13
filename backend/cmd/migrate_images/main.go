package main

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/credentials"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/s3"
	_ "github.com/lib/pq"
)

// Configuration details from 'supabase status'
const (
	SupabaseDBURL      = "postgresql://postgres:postgres@127.0.0.1:54322/postgres?sslmode=disable"
	SupabaseStorageURL = "http://127.0.0.1:54321/storage/v1/s3"
	StorageAccessKey   = "625729a08b95bf1b7ff351a663f3a23c"
	StorageSecretKey   = "850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254aed6eda37307425907"
	BucketName         = "companions"
	ProjectURL         = "http://127.0.0.1:54321"
)

func main() {
	// 1. Connect to Database
	db, err := sql.Open("postgres", SupabaseDBURL)
	if err != nil {
		log.Fatalf("Failed to connect to DB: %v", err)
	}
	defer db.Close()

	// 2. Initialize S3 Session
	s3Config := &aws.Config{
		Credentials:      credentials.NewStaticCredentials(StorageAccessKey, StorageSecretKey, ""),
		Endpoint:         aws.String(SupabaseStorageURL),
		Region:           aws.String("us-east-1"), // Unused but required
		DisableSSL:       aws.Bool(true),
		S3ForcePathStyle: aws.Bool(true),
	}
	sess, err := session.NewSession(s3Config)
	if err != nil {
		log.Fatalf("Failed to create S3 session: %v", err)
	}
	svc := s3.New(sess)

	// 3. Define Image Mappings (Local File -> Companion Name/ID)
	// We need to query companions first to match names
	rows, err := db.Query("SELECT id, name FROM companions")
	if err != nil {
		log.Fatalf("Failed to fetch companions: %v", err)
	}
	defer rows.Close()

	// 2.5 Ensure Bucket Exists
	_, err = db.Exec(`
		INSERT INTO storage.buckets (id, name, public) 
		VALUES ($1, $1, true) 
		ON CONFLICT (id) DO NOTHING
	`, BucketName)
	if err != nil {
		log.Fatalf("Failed to create bucket: %v", err)
	}
	fmt.Println("✅ Bucket 'companions' ensured.")

	companionMap := make(map[string]string) // Name -> ID
	for rows.Next() {
		var id, name string
		if err := rows.Scan(&id, &name); err != nil {
			log.Fatal(err)
		}
		companionMap[name] = id
	}

	// Manual mapping based on file existence
	// We look for images in backend root (where I'll run this) or specific paths
	// Expected paths: frontend/public/images/explore/..., images/...

	// Let's define the source files we want to use for avatars.
	// Based on file list:
	// Gojo: images/gojo/gojo-profile.png
	// Yor: images/yor/yor-profile.png
	// Bakugo: ?? (Maybe frontend/public/images/explore/construct_1.png? No, checking list again...)
	// I don't see Bakugo profile.
	// Levi: images/levi/levi-profile.png
	// Power: images/power/Gemini_Generated_Image...
	// Zero Two: images/zerotwo/zero-two-profile.png
	// Makima: images/makima/makima-profile.png

	rootDir := "/Users/boniqx/nectar/anikama"
	imageSources := map[string]string{
		"Satoru Gojo":     filepath.Join(rootDir, "images/gojo/gojo-profile.png"),
		"Yor Forger":      filepath.Join(rootDir, "images/yor/yor-profile.png"),
		"Levi Ackerman":   filepath.Join(rootDir, "images/levi/levi-profile.png"),
		"Power":           filepath.Join(rootDir, "images/power/Gemini_Generated_Image_tcnlz8tcnlz8tcnl.png"),
		"Zero Two":        filepath.Join(rootDir, "images/zerotwo/zero-two-profile.png"),
		"Makima":          filepath.Join(rootDir, "images/makima/makima-profile.png"),
		"Rias Gremory":    filepath.Join(rootDir, "frontend/public/images/explore/rias-gremory.png"),
		"Mikasa Ackerman": filepath.Join(rootDir, "images/mikasa/mikasa-profile.png"),
		"Loid Forger":     filepath.Join(rootDir, "images/loid/loid-profile.png"),
	}

	for name, localPath := range imageSources {
		id, exists := companionMap[name]
		if !exists {
			fmt.Printf("⚠️ Companion '%s' not found in DB, skipping.\n", name)
			continue
		}

		// Verify file exists
		if _, err := os.Stat(localPath); os.IsNotExist(err) {
			fmt.Printf("⚠️ File not found: %s, skipping.\n", localPath)
			continue
		}

		// Upload to S3
		file, err := os.Open(localPath)
		if err != nil {
			log.Printf("Failed to open file %s: %v", localPath, err)
			continue
		}

		// Generate a clean filename for storage
		ext := filepath.Ext(localPath)
		fileName := fmt.Sprintf("%s/profile%s", id, ext) // structure: uuid/profile.png

		// Read file content
		// We can pass file directly to PutObject

		_, err = svc.PutObject(&s3.PutObjectInput{
			Bucket:      aws.String(BucketName),
			Key:         aws.String(fileName),
			Body:        file,
			ContentType: aws.String("image/" + strings.TrimPrefix(ext, ".")),
			ACL:         aws.String("public-read"),
		})
		file.Close()
		if err != nil {
			log.Printf("Failed to upload %s: %v", fileName, err)
			continue
		}

		// Construct Public URL
		// Format: {ProjectURL}/storage/v1/object/public/{BucketName}/{Key}
		publicURL := fmt.Sprintf("%s/storage/v1/object/public/%s/%s", ProjectURL, BucketName, fileName)

		// Update Database
		_, err = db.Exec("UPDATE companions SET avatar_url = $1 WHERE id = $2", publicURL, id)
		if err != nil {
			log.Printf("Failed to update DB for %s: %v", name, err)
			continue
		}

		fmt.Printf("✅ Updated %s: %s\n", name, publicURL)
	}
}
