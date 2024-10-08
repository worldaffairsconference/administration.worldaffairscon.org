import FormData from 'form-data';
import Mailgun from 'mailgun.js';

import { MAILGUN_API_KEY } from '$env/static/private';

const mailgun = new Mailgun(FormData);

export const mg = mailgun.client({
	username: 'api',
	key: MAILGUN_API_KEY,
});
