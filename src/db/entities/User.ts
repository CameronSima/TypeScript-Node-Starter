/* eslint-disable @typescript-eslint/no-unused-vars */
import { ENVIRONMENT } from "../../util/secrets"
import { 
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    OneToMany,
    BeforeInsert,
    BeforeUpdate,
    CreateDateColumn,
    AfterLoad,
    Index
} from "typeorm"
import bcrypt from "bcrypt"


@Entity()
export default class User extends BaseEntity {

    @CreateDateColumn({type: (ENVIRONMENT === "test" ? "datetime" : "timestamp")})
    createdAt: Date
    
    @PrimaryGeneratedColumn()
    id: number

    @Index()
    @Column()
    email: string

    @Column()
    password: string

    @Column({nullable: true})
    passwordResetToken: string

    @Column({type: (ENVIRONMENT === "test" ? "datetime" : "timestamp"), nullable: true})
    passwordResetExpires: Date

    private tempPassword: string

    public comparePassword(candidatePassword: string): Promise<boolean> {
        return bcrypt.compare(candidatePassword, this.password)
    }

    @AfterLoad()
    private loadTempPassword(): void {
        this.tempPassword = this.password
    }

    @BeforeUpdate()
    async beforeUpdate() {
        await this.hashUpdatedPassword()
    }

    @BeforeInsert()
    async beforeInsert() {
        await this.hashPassword()
    }

    private async hashUpdatedPassword() {
        if (this.tempPassword !== this.password) {
            await this.hashPassword()
        }
    }

    private async hashPassword() {
        this.password = await bcrypt.hash(this.password, 10)
    }
}

export interface AuthToken {
    accessToken: string;
    kind: string;
}
