# Securing Electron Apps with OpenID Connect and OAuth 2.0

**TL;DR:** In this article, you will learn how to properly secure Electron applications with OpenID Connect and OAuth 2.0. To keep things as secure as possible, you will learn how to keep sensitive data away from the renderer processes and how to make these processes communicate with the main process to issue secure requests.

## Electron Overview

> Write one or two paragraphs about Electron, why its a good choice, and about its popularity.

> Add a quick paragraph mentioning that there are two types of processes: main and renderers. Then, describe these types on their own sub sections.

### Electron Main Process

> At least three sentences about this type of process. If possible, writing more sentences into two or more paragraphs would be better.

### Electron Renderer Processes

> At least three sentences about this type of process. If possible, writing more sentences into two or more paragraphs would be better.

### Why the Main Process is Securer

> Write about the main process being more secure than the renderer process. Tip: keeping sensitive data in the main process enables developers to load remote resources without worrying about leaking tokens.

## OAuth 2.0 Overview

> At least three sentences about OAuth 2.0. If possible, writing more sentences into two or more paragraphs would be better.

## OpenID Connect Overview

> At least three sentences about OpenID Connect. If possible, writing more sentences into two or more paragraphs would be better.

## Auth0 Introduction

> Write about: what Auth0 is; some of its great features; that [Auth0 is OpenID Connect certified](https://auth0.com/blog/we-are-now-open-id-certified/); and about [other certifications held by Auth0](https://auth0.com/docs/compliance).

> Mention that users will have to register to a free Auth0 account.

### Defining an Auth0 API

> Instruct readers how to create an Auth0 API to represent their backend API.

### Defining an Auth0 Application

> Instruct readers how to create an Auth0 Application to represent their native application.
 
## Creating the Backend API
 
> Quickly instruct readers how to build the `backend` project.

## Creating the Electron Application

> Instruct readers how to create the `frontend` project. In this section, you will have to write about:

1. installing `devDependencies`
2. installing `dependencies`
3. creating `env-variables.json` file
4. creating the `./service/store-service.js` file
5. creating the `./service/auth-service.js` file
6. creating the `./main/auth-process.js` file
7. creating the `./main/app-process.js` file
8. creating the `./main.js` file
9. creating the `./renderer/home.html` file
10. creating the `./renderer/home.js` file
11. creating the `./renderer/home.css` file

## Conclusion
