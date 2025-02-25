import { Length } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'ThreadItems' })
export class ThreadItem {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'bigint' })
  name: string

  @Column('int', {
    name: 'Views',
    default: 0,
    nullable: false,
  })
  views: number

  @Column('boolean', {
    name: 'IsDisabled',
    default: false,
    nullable: false,
  })
  IsDisabled: string

  @Column('varchar', {
    name: 'Body',
    length: 2500,
    nullable: true,
  })
  @Length(10, 2500)
  body: string
}
