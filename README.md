# mmo-inventory

[todo: CI/CD pipeline badge]


## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Demo](#demo)
- [Tech stack](#tech-stack)
- [Installation](#installation)
- [Usage](#usage)
- [Configuration](#configuration)
- [Credits](#credits)
- [License](#license)

## Introduction

mmo-inventory is a RESTful MMO-style inventory API that makes it easy to manage user accounts and items in your game project. Powered by Google Firebase, the app comes bundled with a simple web frontend that allows developers to start configuring their game items right out of the box.

## Features
- Easy-to-integrate commonplace inventory features such as stacking, sorting, and equipping
- Connect to your own Firebase project to retain total control of your item database
- Easily view and manage all items in your database via a built-in frontend web tool
- Mass-import items to your game's database just by uploading a single JSON file

{screenshots}


## Demo
Coming soon

## Tech stack
- Express.js
- Google Firebase
- React
- Bruno
- Figma

## Installation

### Requirements
- Access to an empty (or preexisting) Firebase project
- Node version >= v20.8.1 and npm version >= 10.1.0 installed (probably works with older versions - untested)

### Installation steps
1. Download the repository and install required packages with `npm init`.
2. At the project root, add the following fields to the empty `.env` environment file to allow the API to connect to your Firebase project:
```
FIREBASE_API_KEY
FIREBASE_AUTH_DOMAIN
FIREBASE_PROJECT_ID
FIREBASE_STORAGE_BUCKET
FIREBASE_MESSAGING_SENDER_ID
FIREBASE_APP_ID
FIREBASE_MEASUREMENT_ID
```

### Building and Hosting

## Usage

`npm run server`

`npm run client`

### Example usage

## Configuration

## Credits


## License
MIT License
