import express from 'express';
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs, resolvers } from './schemas/index.js';
//import path from 'node:path';
import db from './config/connection.js';
//import routes from './routes/index.js';
import { authenticateToken } from './services/auth.js';

const app = express();
const PORT = process.env.PORT || 3001;
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const startApolloServer = async () => {
  await server.start();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/graphql', expressMiddleware(server as any, {
  context: authenticateToken as any,
}))

if (process.env.NODE_ENV === 'production') {
  app.use(express.static('client/dist')); //server static files

  app.get('*', (_req, res) => {
    res.sendFile('index.html', { root: 'client/dist' });
  });
}
db.on('error', console.error.bind(console,'MongoDB connection error:'));

app.listen(PORT, () => {
  console.log(`🚀 API Server running on ${PORT}!`);
  console.log(`🌍User GraphQL at http://localhost:${PORT}/graphql`);
});
}

startApolloServer();
