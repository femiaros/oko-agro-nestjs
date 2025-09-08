import { AppDataSource } from '../config/data-source';
import { Crop } from '../crops/entities/crop.entity';

async function seedCrops() {
  await AppDataSource.initialize();

  const cropRepo = AppDataSource.getRepository(Crop);

  const cropNames = [
    'Cassava', 'Cocoa', 'Tomatoes', 'Sorghum', 'Palm Oil',
    'Pepper', 'Maize', 'Groundnuts', 'Onions', 'Plantain',
    'Sweet Potato', 'Okra', 'Rice', 'Millet', 'Yam',
    'Beans', 'Others',
  ];

  for (const name of cropNames) {
    const exists = await cropRepo.findOne({ where: { name } });
    if (!exists) {
      const crop = cropRepo.create({ name });
      await cropRepo.save(crop);
      console.log(`✅ Inserted crop: ${name}`);
    } else {
      console.log(`⚡ Skipped existing crop: ${name}`);
    }
  }

  await AppDataSource.destroy();
}

seedCrops()
  .then(() => {
    console.log('🌱 Crops seeding complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Error seeding crops:', err);
    process.exit(1);
  });
