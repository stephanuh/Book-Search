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
        description: string;
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

        me: async (_parent: any, _args: any, context: any) => {
            console.log('Running me query!');

            if (context.user) {
                return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('Could not authenticate user!');
        }
    },

    Mutation: {
        addUser: async (_parent: any, { input }: AddUserArgs) => {
            const user = await User.create({ ...input, savedBooks: [] });
            const token = signToken(user.username, user.email, user._id);
            return { token, user };// return token and user
        },
        login: async (_parent: any, { email, password }: LoginUserArgs) => {
            const user = await User.findOne({ email });

            if (!user){
                // throw an error if user is not found
                throw new AuthenticationError('Cannot authenticate user!');
            }
            const correctPw = await user.isCorrectPassword(password);
            
            if (!correctPw){
                // throw an error if password is incorrect
                throw new AuthenticationError('Wrong password!');
            }
            const token = signToken(user.username, user.email, user._id);
            return { token, user };
        },
        
        //save a book to a user's `savedBooks` field by adding it to the set (to prevent duplicates)
        saveBook: async (_parent: any, { book }: SaveBookArgs, context: any) => {
            if(context.user){
                return await User.findOneAndUpdate(
                    { _id: context.user._id },
                    { $addToSet: { savedBooks: book } },
                    { new: true }
                );
            }
            // User must be logged in to save a book! Throw an authentication error if not.
            throw new AuthenticationError('📚 You need to be logged in to save a book!');
        },

        // remove a book from the `savedBooks`
        removeBook: async (_parent: any, { bookId }: RemoveBookArgs, context: any) => {
            console.log('context = ', context);
            if(!context.user){
                throw new AuthenticationError('You need to be logged in to remove a book!');
            }
            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId: bookId } } },
                { new: true }
            ).populate('savedBooks');

            if(!updatedUser){
                throw new Error('Cannot find user!');
            }
            return updatedUser;
        }
    }
};
export default resolvers;