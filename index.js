const crypto = require('crypto');
const express = require('express');
const bodyParser = require('body-parser');
const sanitizer = require('express-sanitizer');
const rateLimit = require('express-rate-limit')
const mongoose = require('mongoose');
const Paste = require('./models/Paste');

mongoose.connect('mongodb://localhost/pastebin')

const app = express();

app.set('view engine', 'ejs');
// app.disable("x-powered-by");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(sanitizer());

const apiLimiter = rateLimit({
	windowMs: 5 * 60 * 1000,
	max: 10,
	standardHeaders: true,
	legacyHeaders: false,
})

app.use('/api', apiLimiter)


app.get('/', (req, res) => {
    res.render('index')
})

app.get('/:key', (req, res) => {
    var key = req.params.key;
    Paste.findOne({key: key}, (err, record) => {
        if (err) {
            res.sendStatus(500).end();
        } else if (!record) {
            res.sendStatus(404).end();
        } else {
            if (record.paste_type == 1) {
                res.setHeader("X-Robots-Tag", "noindex, noarchive");
            }
            res.type('html');
            res.render('paste', {
                paste: record
            });
        }
    })
})

app.get('/raw/:key', (req, res) => {
    var key = req.params.key;
    Paste.findOne({key: key}, (err, record) => {
        if (err) {
            res.sendStatus(500).end();
        } else if (!record) {
            res.sendStatus(404).end();
        } else {
            if (record.paste_type == 1) {
                res.setHeader("X-Robots-Tag", "noindex, noarchive");
            }
            res.type('text');
            res.send(record.content);
        }
    })
})

app.post('/api/newpaste', (req, res) => {
    Paste.create({
        name: (req.body.name ? req.body.name: "Untitled Paste"),
        key: crypto.randomBytes(5).toString('hex').toUpperCase(),
        content: req.body.content,
        paste_type: req.body.paste_type
    }, (err, data) => {
        if (err || !data) {
            res.sendStatus(406).end();
        } else {
            res.format({
                json: () => {
                    res.json({
                        key: data.key,
                        url: `${req.protocol}://${req.hostname}/${data.key}`,
                        raw_url: `${req.protocol}://${req.hostname}/raw/${data.key}` 
                    })
                },

                text: () => {
                    res.send(`${req.protocol}://${req.hostname}/${data.key}`)
                },

                html: () => {
                    res.redirect(`${req.protocol}://${req.hostname}/${data.key}`);
                }
            });
        }
    });
})

app.listen(80, () => {
    console.log("Listening on http://localhost:80/");
})