package gemini

import (
	"context"
	"fmt"
	"os"

	"github.com/google/generative-ai-go/genai"
	"google.golang.org/api/option"
)

type Client struct {
	client *genai.GenerativeModel
}

// NewClient creates a new Gemini AI client
func NewClient(ctx context.Context) (*Client, error) {
	apiKey := os.Getenv("GEMINI_API_KEY")
	if apiKey == "" {
		return nil, fmt.Errorf("GEMINI_API_KEY environment variable is not set")
	}

	client, err := genai.NewClient(ctx, option.WithAPIKey(apiKey))
	if err != nil {
		return nil, fmt.Errorf("failed to create Gemini client: %w", err)
	}

	model := client.GenerativeModel("gemini-pro")
	
	// Set default generation config
	model.SetTemperature(0.9)
	model.SetTopK(40)
	model.SetTopP(0.95)
	model.SetMaxOutputTokens(1024)

	return &Client{
		client: model,
	}, nil
}

// GenerateResponse generates a response from Gemini based on system prompt and user message
func (c *Client) GenerateResponse(ctx context.Context, systemPrompt, userMessage string, maxTokens int32) (string, error) {
	// Combine system prompt with user message
	fullPrompt := fmt.Sprintf("%s\n\nUser: %s\n\nAssistant:", systemPrompt, userMessage)

	// Override max tokens if specified
	if maxTokens > 0 {
		c.client.SetMaxOutputTokens(maxTokens)
	}

	resp, err := c.client.GenerateContent(ctx, genai.Text(fullPrompt))
	if err != nil {
		return "", fmt.Errorf("failed to generate content: %w", err)
	}

	if len(resp.Candidates) == 0 || len(resp.Candidates[0].Content.Parts) == 0 {
		return "", fmt.Errorf("no response generated")
	}

	// Extract text from response
	text := fmt.Sprintf("%v", resp.Candidates[0].Content.Parts[0])
	
	return text, nil
}

// GenerateResponseWithLimit generates a limited response for free tier users
func (c *Client) GenerateResponseWithLimit(ctx context.Context, systemPrompt, userMessage string) (string, error) {
	// Free tier gets max 256 tokens (shorter responses)
	return c.GenerateResponse(ctx, systemPrompt, userMessage, 256)
}

// GenerateResponsePremium generates a full response for premium users
func (c *Client) GenerateResponsePremium(ctx context.Context, systemPrompt, userMessage string) (string, error) {
	// Premium tier gets max 1024 tokens (longer responses)
	return c.GenerateResponse(ctx, systemPrompt, userMessage, 1024)
}
