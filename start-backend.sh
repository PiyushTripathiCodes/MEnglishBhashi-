#!/bin/bash
echo "Starting LearnHub Backend..."
echo ""
echo "Navigating to server directory..."
cd server
echo ""
echo "Installing dependencies..."
npm install
echo ""
echo "Seeding database with sample data..."
npm run seed
echo ""
echo "Starting development server..."
npm run dev
