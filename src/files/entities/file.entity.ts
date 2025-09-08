import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity('files')
export class File {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string; // firstname_lastname_description_random4digits

    @Column()
    description: string; // e.g. "userPhoto", "farmPhoto"

    @Column()
    mimeType: string;

    @Column()
    size: string; // in KB (we’ll capture when uploading)

    @Column()
    url: string;

    @Column()
    publicId: string; // from Cloudinary

    @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
    owner: User;

    // ✅ Timestamp fields
    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
