# Yappers
3813 Assignment
This is my assignment for 3813 ICT Griffith University where I have been tasked with making a website application for chatting between users.
Phase 1 of the application is to implement the front end of this application with 3 different user types, a base user, a group admin and a super admin all with different privilege levels.
User logins can be entered using the respective accounts username and password to access the different privilege levels.
Base user has the username: user and password: user
Group admin has the username: group and password: group
Super admin has the username: super and password: super.


System Architecture and Implementation

Angular Architecture: Components, Services, Models, Routes
The Angular app is built using standalone components that represent different parts of the user interface, like the login screen, dashboard, and chat areas. Services handle the business logic and shared data, allowing components to communicate, authenticate users, and interact with the backend seamlessly. Models define the structure of data for users, groups, channels, and messages, while routes manage navigation between pages and control access based on user roles.

Node Server Architecture: Modules, Functions, Files, Global Variables
The Node.js server is organized into modules, each responsible for specific features such as user authentication, group management, or message handling. Each module contains functions to create users, verify login credentials, manage groups, and store message histories. Server files are organized logically, and global variables track connected users and active chat sessions, enabling real-time communication.

Server-Side Routes: Parameters, Return Values, and Purpose
The server provides routes for tasks like logging in users, fetching group and channel information, posting messages, and managing permissions. These routes take parameters such as user IDs, group IDs, channel IDs, or message content, and return JSON responses to confirm success or provide the requested data. They ensure secure, controlled access to information and allow the frontend to display the latest updates to authenticated users.

Client-Server Interaction: Data Changes and Component Updates
The client talks to the server through HTTP requests and WebSocket events, sending actions like logging in, posting messages, or creating groups. On the server, these actions update in-memory data structures (and eventually MongoDB) to reflect new users, messages, or changes in group membership. Angular components automatically update their displays through reactive data binding, letting users see chat messages, group lists, and channel contents in real time.

Data Structures for Users, Groups, and Channels
On the client side, users are objects containing details like username, email, unique ID, roles, and associated groups. Groups include a name, ID, member list, and channels, while channels contain a name, ID, and message history. The server maintains the same structures in memory and later stores them in MongoDB, making authentication, message routing, and role-based access control efficient and reliable.
