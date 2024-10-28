const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static(__dirname));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// The main index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// The guestbook page
app.get('/guestbook', (req, res) => {
    res.sendFile(path.join(__dirname, 'guestbook.html'));
});

// The new message page
app.get('/newmessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'newmessage.html'));
});

// The AJAX message page
app.get('/ajaxmessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'ajaxmessage.html'));
});

// Endpoint to get all guestbook messages
app.get('/guestbook.json', (req, res) => {
    fs.readFile('guestbook.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading guestbook data');
        }
        try {
            // Parse messages from the file
            const messages = JSON.parse(data);
            // Send all messages to guestbook.html
            res.json(messages);
        } catch (parseError) {
            return res.status(500).send('Error parsing guestbook data');
        }
    });
});

// Endpoint to add a new message from the traditional form
app.post('/newmessage', (req, res) => {
    const { username, country, message } = req.body;
    if (!username || !country || !message) {
        return res.status(400).send('All fields are required');
    }

    const newMessage = {
        username,
        country,
        date: new Date().toString(),
        message
    };

    // Read the guestbook.json file, update, and save
    fs.readFile('guestbook.json', 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading guestbook data');
        }
        const messages = JSON.parse(data);
        messages.push(newMessage);

        fs.writeFile('guestbook.json', JSON.stringify(messages, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error saving message');
            }
            res.json({ success: true });
        });
    });
});

// Endpoint to handle AJAX-submitted messages
app.post('/ajaxmessage', (req, res) => {
    const { username, country, message } = req.body;
    if (!username || !country || !message) {
        return res.status(400).send('All fields are required');
    }

    const newMessage = {
        username,
        country,
        date: new Date().toString(),
        message,
        // Mark AJAX messages as hidden
        isHidden: true
    };

    // Read the guestbook.json file
    fs.readFile('guestbook.json', 'utf8', (err, data) => {
        // If there's an error reading the file, send a 500 response with an error message
        if (err) {
            return res.status(500).send('Error reading guestbook data');
        }
        // Parse the file content into a JavaScript array of messages
        const messages = JSON.parse(data);
        // Add the new message object to the messages array
        messages.push(newMessage);

        // Write the updated array back to guestbook.json in JSON format
        fs.writeFile('guestbook.json', JSON.stringify(messages, null, 2), 'utf8', (err) => {
            if (err) {
                return res.status(500).send('Error saving message');
            }
            // Send a success response if the writing was successful
            res.json({ success: true });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
