#!/usr/bin/env node

// Local CMS backend server for testing content editing without authentication
// This allows editing content locally, then you can manually commit changes to GitHub
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8082; // Different from main server port

// Enable CORS for all routes
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Setup the local backend API
app.use('/api/v1', require('netlify-cms-backend-fs/dist/fs'));

app.listen(PORT, () => {
  console.log(`Local CMS backend running on http://localhost:${PORT}`);
  console.log(`Access the admin interface at http://localhost:8080/admin/`);
});
