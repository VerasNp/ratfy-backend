import express, { type Request, type Response, Router } from 'express'

const app = express()
const port = process.env.PORT ?? '9001'

const route = Router()

app.use(express.json())

route.get('/', (req: Request, res: Response) => {
	res.json({ message: 'hello world with Tyspescript' })
})

app.use(route)

app.listen(port, () => `server running on port ${port}`)
