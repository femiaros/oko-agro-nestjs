import { AppDataSource } from '../config/data-source';
import { Certification } from '../certifications/entities/certification.entity';

async function seedCertifications() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Certification);

    const names = [
        'NAFDAC Reistration',
        'SON Certification',
        'ISO 22000',
        'HACCP',
        'Organic Certification',
        'Hala Certification',
        'Export License',
        'GMP Certification',
        'Others',
    ];

    for (const name of names) {
        const exists = await repo.findOne({ where: { name } });
        if (!exists) {
        const item = repo.create({ name });
        await repo.save(item);
        console.log(`✅ Inserted certification: ${name}`);
        } else {
        console.log(`⚡ Skipped existing certification: ${name}`);
        }
    }

    await AppDataSource.destroy();
}

seedCertifications()
    .then(() => {
    console.log('🌱 Certifications seeding complete.');
    process.exit(0);
    })
    .catch((err) => {
    console.error('❌ Error seeding certifications:', err);
    process.exit(1);
    });
