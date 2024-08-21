import FormData from 'form-data';
import Mailgun from 'mailgun.js';

const mailgun = new Mailgun(FormData);

export const mg = mailgun.client({
	username: 'api',
	key: process.env.MAILGUN_API_KEY ?? '',
});

let iCal = `BEGIN:VCALENDAR
PRODID:-//World Affairs Conference//Schedule
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:REQUEST
BEGIN:VEVENT
DTSTART:${'20240427T150000Z'}
DTEND:${'20240427T160000Z'}
DTSTAMP:${'20230419T181455Z'}
ORGANIZER;CN=World Affairs Conference:mailto:noreply@worldaffairscon.org
UID:${'428902389424232430'}@worldaffairscon.org
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE;CN=Samuel Martineau;X-NUM-GUESTS=0:mailto:darwin.li@ucc.on.ca
CREATED:${'20230419T181455Z'}
DESCRIPTION:${'description'}
LAST-MODIFIED:${'20230419T181455Z'}
LOCATION:${'location'}
SEQUENCE:${3}
STATUS:CONFIRMED
SUMMARY:${'Title5'}
TRANSP:OPAQUE
END:VEVENT
BEGIN:VEVENT
DTSTART:${'20240428T150000Z'}
DTEND:${'20240428T160000Z'}
DTSTAMP:${'20230419T181455Z'}
ORGANIZER;CN=World Affairs Conference:mailto:noreply@worldaffairscon.org
UID:${'42890238904324390823'}@worldaffairscon.org
ATTENDEE;CUTYPE=INDIVIDUAL;ROLE=REQ-PARTICIPANT;PARTSTAT=ACCEPTED;RSVP=FALSE;CN=Samuel Martineau;X-NUM-GUESTS=0:mailto:darwin.li@ucc.on.ca
CREATED:${'20230419T181455Z'}
DESCRIPTION:${'description'}
LAST-MODIFIED:${'20230419T181455Z'}
LOCATION:${'location'}
SEQUENCE:${3}
STATUS:CONFIRMED
SUMMARY:${'Title5'}
TRANSP:OPAQUE
END:VEVENT
END:VCALENDAR`;

console.log(iCal);

const out = await mg.messages.create('worldaffairscon.org', {
	'from': 'registration@worldaffairscon.org',
	'to': 'darwin.li@ucc.on.ca',
	'subject': 'Invitation to World Affairs Conference 2024',
	'text': 'You are invited to the World Affairs Conference 2024!\n',
	'attachment': [
		{
			filename: 'invite.ics',
			contentType: 'text/calendar;method=REQUEST;name="invite.ics"',
			data: iCal,
		},
	],
	'h:Content-class': 'urn:content-classes:calendarmessage',
});

console.log(out);
