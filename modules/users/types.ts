// return a user from 
export type User = {
    id: string
    email: string
    username: string
}

// create a user
export type CreateUser = {
    email: string
    username: string
}

// updating a user
export type UpdateUser = {
    email?: string
    username?: string
}
