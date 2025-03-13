import { setContext } from '@apollo/client/link/context';
import Auth from './utils/auth';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import {
  ApolloClient, 
  InMemoryCache,
  ApolloProvider,
  createHttpLink
} from '@apollo/client';

import './App.css';


const httpLink = createHttpLink({
  uri: '/graphql'
});

const authLink = setContext((_, { headers }) => {
  const token = Auth.getToken();
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache()
});

function App() {
  return (
    <ApolloProvider client={client}>
      <Navbar/>
      <Outlet/>
    </ApolloProvider>
  );
}

export default App;
