# Database schema

## Overview

This document outlines the database schema for the application, detailing the tables, their fields, and relationships. The schema is designed to support the core functionalities of user management, content storage, and interaction tracking.

## Database Purpose

The purpose of the database is to store events and youtube video information for the Phoenix Sound website.

## Users

There is a single admin user who can log in and manage the content on the site.

## Tables

### Users Table "users"
- `id` (Primary Key, Integer, Auto-increment): Unique identifier for each user.
- `username` (String, Unique): The username of the user.
- `password` (String): The hashed password of the user.
- `email` (String, Unique): The email address of the user.
- `created_at` (Timestamp): The date and time when the user was created.
- `updated_at` (Timestamp): The date and time when the user was last updated.

### Events Table "events"
- `id` (Primary Key, Integer, Auto-increment): Unique identifier for each event.
- `title` (String): The title of the event.
- `description` (Text): A detailed description of the event.
- `date` (DateTime): The date and time when the event is scheduled to occur
- `created_at` (Timestamp): The date and time when the event was created.
- `updated_at` (Timestamp): The date and time when the event was last updated.

### YouTube Videos Table "video"
- `id` (Primary Key, Integer, Auto-increment): Unique identifier for each video.
- `youtube_id` (String, Unique): The YouTube video ID.
- `title` (String): The title of the video.
- `description` (Text): A detailed description of the video.
- `thumbnail_url` (String): URL to the video's thumbnail image.
- `created_at` (Timestamp): The date and time when the video was added to the database.
- `updated_at` (Timestamp): The date and time when the video was last updated.

