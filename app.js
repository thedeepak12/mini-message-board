const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.static('public'));

app.set('view engine', 'ejs');
app.set('views', './views');

app.use(express.urlencoded({ extended: true }));

const messages = [];

app.get('/', (req, res) => {
  res.render('index', {
    title: 'Mini Message Board',
    messages: messages
  });
});

app.get('/new', (req, res) => {
  res.render('form', {
    title: 'New Message',
  });
});

app.post('/new', (req, res) => {
  const { messageUser, messageText } = req.body;
  messages.unshift({
    text: messageText,
    user: messageUser,
    added: new Date()
  });
  res.redirect('/');
})

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
