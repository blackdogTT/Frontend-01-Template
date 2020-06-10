const net = require('net')
const images = require('images')
const parser = require('./utils/parser')
const render = require('./utils/render')

class Request {
	constructor(options) {
		this.method = options.method || 'GET'
		this.host = options.host || 'localhost'
		this.port = options.port || 3000
		this.path = options.path || '/'
		this.body = options.body || ''
		this.headers = options.headers || {}
		this.bodyText = ''

		if (!this.headers['Content-Type']) {
			this.headers['Content-Type'] = 'application/json; charset=utf-8'
		}

		if (this.headers['Content-Type'].includes('application/json')) {
			this.bodyText = JSON.stringify(this.body)
		} else if (this.headers['Content-Type'].includes('text/plain')) {
			this.bodyText = this.body
		}

		this.headers['Content-Length'] = Buffer.byteLength(this.bodyText)
	}

	send() {
		return new Promise((resolve, reject) => {
			const parser = new ResponseParser()
			const client = net.createConnection({
				host: 'localhost',
				port: 3000
			}, () => {
				client.write(request.toString())
			}).on('data', data => {
				parser.receive(data.toString())
				if (parser.isFinished) resolve(parser.response)
				client.end()
			}).on('error', err => {
				reject(err)
				client.end()
			})
		})
	}

	toString() {
		return `${this.method} ${this.path} HTTP/1.1
${Object.keys(this.headers).map(key => `${key}: ${this.headers[key]}`).join('\r\n')}
${this.bodyText}`
	}
}

class Response {

}

class ResponseParser {
	constructor() {
		this.WAITING_STATUS_LINE = 0
		this.WAITING_STATUS_LINE_END = 1
		this.WAITING_HEADER_NAME = 2
		this.WAITING_HEADER_SPACE = 3
		this.WAITING_HEADER_VALUE = 4
		this.WAITING_HEADER_LINE_END = 5
		this.WAITING_HEADER_BREAK_END = 6
		this.WAITING_BODY = 7

		this.current = this.WAITING_STATUS_LINE
		this.statusLine = ''
		this.headers = {}
		this.headerName = ''
		this.headerValue = ''
		this.bodyParser = null
	}

	get isFinished() {
		return this.bodyParser && this.bodyParser.isFinished
	}
	get response() {
		const matchList = this.statusLine.match(/^HTTP\/1\.1 ([0-9]{3}) ([\S]+)$/)
		return {
			statusCode: matchList[1],
			statusText: matchList[2],
			headers: this.headers,
			body: this.bodyParser.content.join('')
		}
	}

	receive(str) {
		for (let i = 0; i < str.length; i++) {
			this.receiveCharacter(str.charAt(i))
		}
	}

	receiveCharacter(char) {
		switch (this.current) {
			case this.WAITING_STATUS_LINE:
				if (char === '\r') {
					this.current = this.WAITING_STATUS_LINE_END
				} else {
					this.statusLine += char
				}
				break

			case this.WAITING_STATUS_LINE_END:
				if (char === '\n') {
					this.current = this.WAITING_HEADER_NAME
				}
				break

			case this.WAITING_HEADER_NAME:
				if (char === ':') {
					this.current = this.WAITING_HEADER_SPACE
				} else if (char === '\r') {
					this.current = this.WAITING_HEADER_BREAK_END
				} else {
					this.headerName += char
				}
				break

			case this.WAITING_HEADER_SPACE:
				if (char === ' ') {
					this.current = this.WAITING_HEADER_VALUE
				}
				break

			case this.WAITING_HEADER_VALUE:
				if (char === '\r') {
					this.headers[this.headerName] = this.headerValue
					this.headerName = ''
					this.headerValue = ''
					this.current = this.WAITING_HEADER_LINE_END
				} else {
					this.headerValue += char
				}
				break

			case this.WAITING_HEADER_LINE_END:
				if (char === '\n') {
					this.current = this.WAITING_HEADER_NAME
				}
				break

			case this.WAITING_HEADER_BREAK_END:
				if (char === '\n') {
					this.current = this.WAITING_BODY

					if (this.headers['Transfer-Encoding'] === 'chunked') {
						this.bodyParser = new TrunkBodyParser()
					}
				}
				break

			case this.WAITING_BODY:
				if (this.bodyParser) this.bodyParser.receiveCharacter(char)
				break

			default:
				break
		}

	}
}

const ZERO_CODE_POINT = '0'.codePointAt()

class TrunkBodyParser {
	constructor() {
		this.WAITING_LENGTH = 0
		this.WAITING_LENGTH_LINE_END = 1
		this.READING_TRUNK = 2
		this.WAITING_NEW_LINE = 3
		this.WAITING_NEW_LINE_END = 4

		this.length = 0
		this.content = []
		this.current = this.WAITING_LENGTH
		this.isFinished = false
	}

	receiveCharacter(char) {
		switch (this.current) {
			case this.WAITING_LENGTH:
				if (char === '\r') {
					this.current = this.WAITING_LENGTH_LINE_END
				} else {
					this.length *= 16
					this.length += parseInt(char.codePointAt() - ZERO_CODE_POINT, 16)
				}
				break;

			case this.WAITING_LENGTH_LINE_END:
				if (char === '\n') {
					this.current = this.READING_TRUNK
					if (this.length === 0) {
						this.isFinished = true
						this.current = this.WAITING_NEW_LINE
					}
				}
				break;

			case this.READING_TRUNK:
				this.content.push(char)
				this.length--
				if (this.length === 0) {
					this.current = this.WAITING_NEW_LINE
				}
				break;

			case this.WAITING_NEW_LINE:
				if (char === '\r') {
					this.current = this.WAITING_NEW_LINE_END
				}
				break;

			case this.WAITING_NEW_LINE_END:
				if (char === '\n') {
					this.current = this.WAITING_LENGTH
				}
				break;

			default:
				break;
		}
	}
}

/** run */
const request = new Request({
	method: 'GET',
	headers: {
		'Content-Type': 'text/plain'
	},
	body: 'name=666'
})
request.send().then(res => {
	const dom = parser.parseHTML(res.body)
	const viewport = images(1920, 1080)
	render(viewport, dom)
	viewport.save('toy-browser.jpg')
}).catch(err => {
	console.log(err)
})