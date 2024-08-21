import _ from 'lodash';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import Mailgun from 'mailgun.js';
import { format as formatDate } from 'date-fns/fp';
import { Speakers, getXataClient } from '../src/lib/server/xata.generated';

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const xata = getXataClient();

const mailgun = new Mailgun(FormData);

export const mg = mailgun.client({
	username: 'api',
	key: process.env.MAILGUN_API_KEY ?? '',
});

type CalendarEvent = {
	startTime: Date;
	endTime: Date;
	summary: string;
	description: string;
	location: string;
	id: string;
};

const plenaries = Object.fromEntries(
	(
		await xata.db.plenaries
			.filter('confirmed', true)
			.select([
				'theme',
				'location.name',
				'scheduleSlot.startTime',
				'scheduleSlot.endTime',
				{ name: '<-speakers.plenary', as: 'speakers', columns: ['name', 'shortBio'] },
			])
			.getAll()
	).map((p) => [p.id, { ...p, speakers: p.speakers.records as Speakers[] }]),
);

const attendees = (
	await xata.db.attendees
		// .filter({
		// 	email: { $any: ['darwin.li@ucc.on.ca'] },
		// })
		.select([
			'email',
			'needsLunch',
			'firstName',
			'lastName',
			{
				name: '<-attendees_plenaries.attendee',
				as: 'plenaries',
				columns: ['assigned', 'plenary'],
			},
		])
		.getAll()
).map((a) => ({
	...a,
	plenaries: a.plenaries.records.filter((p) => p.assigned).map((p) => plenaries[p.plenary]),
}));

const template = _.template(
	(await fs.readFile(path.join(import.meta.dirname, 'hyrrokkin.ics'))).toString(),
);

for (const [i, attendee] of Object.entries(attendees)) {
	// TODO: Investigate — For some reason, whenever a calendar invitation contains more than six events, Google Calendar ignores it
	const events: CalendarEvent[] = [
		{
			startTime: new Date('2024-03-06 9:30:00 EST'),
			endTime: new Date('2024-03-06 10:30:00 EST'),
			summary: 'Opening Keynote',
			description: 'Masai Ujiri — Giants of Africa, CEO of Toronto Raptors',
			id: 'opening-keynote',
			location: 'Laidlaw Hall',
		},
		{
			startTime: new Date('2024-03-06 12:25:00 EST'),
			endTime: new Date('2024-03-06 13:25:00 EST'),
			summary: 'Lunch & Networking',
			description: attendee.needsLunch ? 'Lunch provided' : 'Lunch not provided',
			id: 'lunch-networking',
			location: 'Whole School',
		},
		{
			startTime: new Date('2024-03-06 14:25:00 EST'),
			endTime: new Date('2024-03-06 15:25:00 EST'),
			summary: 'Closing Keynote',
			description:
				"Roberta L. Bondar — C.C. O.Ont. MD PhD FRSC ICD.D, Astronaut | Physician | Scientist | Photographer\\n\\nThe first Canadian woman and neurologist to fly in space, Dr. Roberta Bondar is globally recognized for her pioneering contributions to space medicine research, fine art photography, and environment education. She expanded the horizons of millions when she joined the space shuttle Discovery for its 1992 mission, where she conducted experiments for 18 countries in the International Microgravity Laboratory, a precursor to the International Space Station. Her highly motivational talks — punctuated by her stunning photographs — focus on change, social responsibility, and our environment. For more than a decade after her spaceflight, Dr. Bondar headed an international space medicine research team, finding new connections between astronauts recovering from spaceflight and neurological illnesses on Earth, such as stroke and Parkinson's disease. Her techniques have been used in clinical studies at the B. I. Deaconess Medical Center, a teaching hospital of Harvard Medical School and at the University of New Mexico. Dr. Bondar was also Chancellor of Trent University in Peterborough, Ontario for six years. Dr. Bondar is a leading speaker and consultant within the medical and scientific communities, and in the field of corporate social responsibility and care for the Earth's environment. She is the co-founder and president of The Roberta Bondar Foundation, a not-for profit charitable organization created to inspire people of all ages to connect with nature through photography. She is also the author of four bestselling books featuring her writing and photography. Dr. Bondar holds a BSc in Zoology and Agriculture, MSc in Experimental Pathology, PhD in Neurobiology, MD, and is a Board-Certified Neurologist by the Royal College of Physicians and Surgeons of Canada. She sub-specialized in Neuro-ophthalmology at Tufts New England Medical Center in Boston and at Toronto Western Hospital. Among many awards and honours, Dr. Bondar has been recognized with the NASA Space Medal, inducted into the Canadian Medical Hall of Fame and the International Women's Forum Hall of Fame for her pioneering research in space medicine. She has also received 28 Honorary Degrees from universities across Canada and is a Companion of the Order of Canada and a recipient of the Order of Ontario. She is also a Specially Elected Fellow of the Royal Society of Canada, an Honorary Fellow and Honorary Vice-President of the Royal Canadian Geographical Society, and has her own star on Canada's Walk of Fame.",
			id: 'closing-keynote',
			location: 'Laidlaw Hall',
		},
		...attendee.plenaries.map((p, i) => ({
			startTime: p.scheduleSlot!.startTime!,
			endTime: p.scheduleSlot!.endTime!,
			summary: p.theme!,
			description: p.speakers
				.map((s) => `${s.name}\\n\\n${s.shortBio}`)
				.join('\\n\\n=========\\n\\n'),
			location: p.location!.name!,
			id: `plenary-${i}`,
		})),
	];

	const iCal = template({
		events,
		sequence: 101,
		attendee,
		toICSDate: formatDate("yyyyMMdd'T'HHmmss"),
	});

	await mg.messages.create('worldaffairscon.org', {
		'from': 'World Affairs Conference <noreply@worldaffairscon.org>',
		'to': attendee.email!,
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

	console.log(`Sent to ${attendee.email} — ${+i + 1} / ${attendees.length}`);
}
