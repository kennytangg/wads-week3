import { User, UpdateUser, CreateUser } from "./types";

const dummyData: User[] = [
    { id: "U100", email: "alice@example.com", username: "alice" },
    { id: "U101", email: "bob@example.com", username: "bob" },
    { id: "U102", email: "charlie@example.com", username: "charlie" }
];

export class UserRepository {
    private data: User[] = dummyData;

    constructor(data: User[]) {
        this.data = data;
    }

    // get all users
    async getUsers(): Promise<User[]> {
        return this.data;
    }

    // get single user by id
    async getUserById(id: string): Promise<User | null> {
        const user = this.data.find(user => user.id === id);
        if (!user) return null;

        return user;
    }

    // create a user
    async createUser({ username, email }: CreateUser): Promise<User> {
        const newUser: User = {
            id: Date.now().toString(),
            username: username,
            email: email,
        };

        this.data.push(newUser);

        return newUser;
    }

    // update a user
    async updateUser(id: string, data: UpdateUser): Promise<User | null> {
        const index = this.data.findIndex(user => user.id === id);
        if (index === -1) {
            return null;
        }

        const updatedUser = { ...this.data[index], ...data };

        this.data[index] = updatedUser;
        return updatedUser;
    }

    // delete a user
    async deleteUser(id: string): Promise<boolean> {
        const idx = this.data.findIndex(user => user.id === id);

        if (idx === -1) {
            return false;
        }

        this.data.splice(idx, 1)
        return true;
    }
}


