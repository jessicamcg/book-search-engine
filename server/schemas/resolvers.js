const { Book, User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        book: async () => {
            return Book.find({});
        },
        user: async (parent, { username }) => {
            return User.findOne({ username });
        },
        me: async (parent, args, context) => {
            if (context.user) {
            return User.findOne({ _id: context.user._id });
            }
            throw new AuthenticationError('You need to be logged in!');
        },
    },
    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            const token = signToken(user);
            return { token, user };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
      
            if (!user) {
              throw new AuthenticationError('No user found with this email address');
            }
      
            const correctPw = await user.isCorrectPassword(password);
      
            if (!correctPw) {
              throw new AuthenticationError('Incorrect credentials');
            }
      
            const token = signToken(user);
      
            return { token, user };
        },
        saveBook: async (parent, args) => {
            const savedBook = await Book.create(args);
            return savedBook;
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                return Book.findOneAndUpdate(
                  { _id: bookId },
                  {
                    $pull: {
                      books: { _id: bookId },
                    },
                  },
                  { new: true }
                );
            }
        }
    }
}

module.exports = resolvers;