const express = require('express');
const fs = require('fs');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Serve static files from the current directory
app.use(express.static(__dirname)); // Serves all files in the directory
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the main index page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the guestbook page
app.get('/guestbook', (req, res) => {
    res.sendFile(path.join(__dirname, 'guestbook.html'));
});

// Serve the new message page
app.get('/newmessage', (req, res) => {
    res.sendFile(path.join(__dirname, 'newmessage.html'));
});

// Serve the AJAX message page
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
            const messages = JSON.parse(data); // Parse messages from the file
            res.json(messages); // Send all messages to guestbook.html
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
            res.json({ success: true }); // Send success response
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
        isHidden: true // Mark AJAX messages as hidden
    };

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
            res.json({ success: true }); // Send success response
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
