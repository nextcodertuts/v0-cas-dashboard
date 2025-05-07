import type { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface User {
    role: UserRole
    id: string
  }

  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: UserRole
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    id: string
  }
}
