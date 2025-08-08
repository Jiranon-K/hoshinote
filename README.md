# 🌟 Hoshilog

A modern, full-featured blog platform built with Next.js 15, TypeScript, and MongoDB. Create, manage, and share your content with a powerful and intuitive interface.

## ✨ Features

- 🔐 **Authentication System** - User registration, login with NextAuth.js
- 📝 **Rich Text Editor** - Powered by TipTap with formatting options
- 💬 **Comments System** - Nested comments with moderation
- 🎛️ **Dashboard** - Comprehensive admin and user dashboards
- 🔍 **Search & Filter** - Find content easily
- 📱 **Responsive Design** - Works perfectly on all devices
- 🚀 **SEO Optimized** - Built-in SEO features
- 🔒 **Role-based Access** - Admin, Author, and Reader roles
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Rich Text**: TipTap Editor
- **Forms**: React Hook Form + Zod validation
- **Package Manager**: Bun

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- MongoDB database (local or Atlas)

 **Run the development server**
 
## 📚 API Routes

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (NextAuth)

### Posts
- `GET /api/posts` - Get all published posts
- `POST /api/posts` - Create new post (authenticated)
- `GET /api/posts/[id]` - Get post by ID
- `PUT /api/posts/[id]` - Update post (authenticated)
- `DELETE /api/posts/[id]` - Delete post (authenticated)
- `GET /api/posts/slug/[slug]` - Get post by slug
- `GET /api/posts/user` - Get user's posts (authenticated)

### Comments
- `GET /api/posts/[id]/comments` - Get post comments
- `POST /api/posts/[id]/comments` - Create comment (authenticated)
- `PUT /api/comments/[id]` - Update comment (authenticated)
- `DELETE /api/comments/[id]` - Delete comment (authenticated)

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics (authenticated)

## 🎨 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── blog/              # Blog pages
│   └── dashboard/         # Dashboard pages
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── blog/             # Blog-related components
│   ├── dashboard/        # Dashboard components
│   ├── editor/           # Rich text editor
│   ├── layout/           # Layout components
│   ├── providers/        # Context providers
│   └── ui/               # UI components (shadcn/ui)
├── config/               # Configuration files
├── lib/                  # Utility functions
├── models/               # MongoDB/Mongoose models
└── types/                # TypeScript type definitions
```

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [TipTap](https://tiptap.dev/) - Rich text editor
- [NextAuth.js](https://next-auth.js.org/) - Authentication


