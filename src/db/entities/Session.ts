import { ISession } from "connect-typeorm"
import { Column, Entity, Index, PrimaryColumn } from "typeorm"
import { Bigint } from "typeorm-static"
 
@Entity()
export default class Session implements ISession {
  @Index()
  @Column("bigint", { transformer: Bigint })
  public expiredAt = Date.now()
 
  @PrimaryColumn("varchar", { length: 255 })
  public id = ""
 
  @Column("text")
  public json = ""
}