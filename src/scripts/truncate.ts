import { AppDataSource } from '../config/data-source';
import { User } from '../users/entities/user.entity';
import { Crop } from '../crops/entities/crop.entity';
import { File } from '../files/entities/file.entity';

async function truncateAllData() {
  await AppDataSource.initialize();
  
  try {
    console.log('🚮 Truncating all data...');
    
    // Truncate in correct order (respect foreign keys)
    await AppDataSource.getRepository(File).delete({});
    await AppDataSource.getRepository(User).delete({});
    await AppDataSource.getRepository(Crop).delete({});
    
    console.log('✅ All data cleared successfully!');
  } catch (error) {
    console.error('❌ Error truncating data:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

truncateAllData();