#!/bin/bash
# Build script for Render
cd backend
go build -o bin/anikama cmd/api/main.go
