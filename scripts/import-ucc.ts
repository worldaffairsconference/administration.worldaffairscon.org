import Papa from 'papaparse';
import fs from 'fs/promises';
import { getXataClient } from '../src/lib/server/xata.generated';
const xata = getXataClient();

const file = await fs.readFile(process.argv[2]);

const houses = await xata.db.partner_schools.filter('domain', 'ucc.on.ca').getAll();
const housesMap = Object.fromEntries(houses.map((h) => [h.name?.split(' ')[2], h.id]));

const { data } = Papa.parse<{
	'Boarding or day': string;
	'Student grade level': string;
	'House': string;
	'Student ID': string;
	'Last name': string;
	'First name': string;
	'Preferred Name': string;
	'Email': string;
	'Advisors': string;
}>(file.toString(), {
	header: true,
});

for (const { Email: email, House: house } of data) {
	const record = await xata.db.attendees.filter({ email }).getFirst();
	if (!record) continue;
	console.log(record.email, house);
	await record.update({ school: housesMap[house] });
}
