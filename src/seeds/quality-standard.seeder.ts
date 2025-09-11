import { AppDataSource } from '../config/data-source';
import { QualityStandard } from '../quality-standards/entities/quality-standard.entity';

async function seedQualityStandards() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(QualityStandard);

    const names = [
        'Grade A',
        'Grade B',
        'Grade C',
        'Organic Standard',
        'Export Quality',
        'Any Grade',
    ];

    for (const name of names) {
        const exists = await repo.findOne({ where: { name } });
        if (!exists) {
        const item = repo.create({ name });
        await repo.save(item);
        console.log(`✅ Inserted quality standard: ${name}`);
        } else {
        console.log(`⚡ Skipped existing quality standard: ${name}`);
        }
    }

    await AppDataSource.destroy();
}

seedQualityStandards()
    .then(() => {
    console.log('🌱 Quality standards seeding complete.');
    process.exit(0);
    })
    .catch((err) => {
    console.error('❌ Error seeding quality standards:', err);
    process.exit(1);
    });
