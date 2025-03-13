import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useQuery, useMutation } from '@apollo/client';
import { removeBookId } from '../utils/localStorage';

import { GET_ME } from '../utils/queries';
import { REMOVE_BOOK } from '../utils/mutations';

import type { User } from '../models/User.js';
import type { Book } from '../models/Book.js';

const SavedBooks = () => {
  const { loading, data } = useQuery(GET_ME);
  const userData: User = data?.me || { username: '', savedBooks: [] };

  const [removeBook] = useMutation(REMOVE_BOOK, {
    fetchPolicy: 'network-only',
    update(cache, { data }){
      if (!data?.removeBook) {
        console.warn('No data returned from removeBook mutation');
        return;
      }
      console.log('Data returned from removeBook mutation:', data.removeBook);
      const existingUser = cache.readQuery<{ me?: User }>({ query: GET_ME });
      if(!existingUser?.me){
        console.warn('GET_ME not found in cache');
        return;
      }
      cache.writeQuery({
        query: GET_ME,
        data: {
          me: {
            ...existingUser.me,
            savedBooks: data.removeBook.savedBooks,
          },
        },
      });
    },
  });

  // create function that accepts the book's mongo _id value as param and deletes the book from the database
  const handleDeleteBook = async (bookId: string) => {
    try {
      await removeBook({
        variables: { bookId },
      });
      removeBookId(bookId);

  } catch (err){
    console.error(err);
  }
};
if(loading){
  return <h2>LOADING...</h2>;
}

  return (
    <>
      <div className='text-light bg-dark p-5'>
        <Container>
          {userData.username ? (
            <h1>Viewing {userData.username}'s saved books!</h1>
          ) : (
            <h1>Viewing saved books!</h1>
          )}
        </Container>
      </div>
      <Container>
        <h2 className='pt-5'>
          {userData.savedBooks.length
            ? `Viewing ${userData.savedBooks.length} saved ${
                userData.savedBooks.length === 1 ? 'book' : 'books'
              }:`
            : 'You have no saved books!'}
        </h2>
        <Row>
          {userData.savedBooks.map((book: Book) => {
            console.log('book.bookId= ', book.bookId);
            return (
              <Col key={book.bookId} md='4'>
                <Card border='dark'>
                  {book.image ? (
                    <Card.Img
                      src={book.image}
                      alt={`The cover for ${book.title}`}
                      variant='top'
                    />
                  ) : null}
                  <Card.Body>
                    <Card.Title>{book.title}</Card.Title>
                    <p className='small'>Authors: {book.authors}</p>
                    <Card.Text>{book.description}</Card.Text>
                    <Button
                      className='btn-block btn-danger'
                      onClick={() => handleDeleteBook(book.bookId)}
                    >
                      Delete this Book!
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </>
  );
};

export default SavedBooks;
