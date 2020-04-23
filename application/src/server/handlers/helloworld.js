import express from "express";
const router = express.Router();

router.get('/hello', async (req, res) => {
    try {
        console.log(req);
        res.json({ response: 'Hello World from API helloworld'  });

    } catch (err) {
        res.json({ error: err.message || err.toString() });
    }
});

module.exports = router;