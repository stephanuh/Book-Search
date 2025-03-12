import { Query } from 'mongoose';
import User from '../models/User.js';
import { signToken, AuthenticationError } from '../services/auth.js';

interface UserArgs {
    id?: string;
    username?: string;
};

interface AddUserArgs {
    input: {
        username: string;
        email: string;
        password: string;
    }
};

interface LoginUserArgs {
    email: string;
    password: string;
}

interface SaveBookArgs {
    book: {
        bookId: string;
        title: string;
        authors: string[];
        image: string;
        link: string;
    }
}

interface RemoveBookArgs {
    bookId: string;
}

const resolvers = {
    Query: {
        user: async ( _parent: any, { id, username }: UserArgs) => {
            const foundUser = await User.findOne({
                $or: [{ _id: id }, { username }]
            });
            if (!foundUser){
                throw new Error('Cannot find a user with this id!');
            }
            return foundUser;
        },

        me: async ( _parent: any, _args: any, context: any) => {
            console.log('Running me query!');

            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('Could not authenticate user!');
        }
    },

    Mutation: {}// continue from here
};