import { User } from "src/users/entities/user.entity";
import { Product } from "src/products/entities/product.entity";
import { Event } from "src/events/entities/event.entity";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity('crops')
export class Crop {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    name: string;

    // ✅ Many users can relate to many crops (registration selection)
    @ManyToMany(() => User, (user) => user.crops)
    users: User[];

    // ✅ One crop can be linked to many products
    @OneToMany(() => Product, (product) => product.cropType)
    products: Product[];

    // ✅ One crop can be linked to many events
    @OneToMany(() => Event, (event) => event.crop)
    events: Event[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}