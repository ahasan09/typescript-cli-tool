import { createClient, RedisClientType } from 'redis';

let instance: DbClient | null = null;

export class DbClient {
	client: RedisClientType;
	getAsync: (key: string) => Promise<string | null>;

	constructor() {
		if (instance) {
			return instance;
		}

		this.client = createClient();
		this.client.on('connect', () => {
			console.log('connected');
		});
		this.client.on('error', (err: unknown) => {
			console.log('Error ' + err);
		});
		this.client.on('end', () => {
			console.log('connection close');
		});

		this.client.connect().catch((err: unknown) => {
			console.log('Error ' + err);
		});

		this.getAsync = (key: string) => this.client.get(key);

		instance = this;
	}

	setData(key: string, value: string) {
		this.client.set(key, value).then((reply) => {
			console.log(`Reply from redis-server after set data: ${reply}`);
		});
	}
}
