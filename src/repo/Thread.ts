import { Length } from 'class-validator'
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm'

@Entity({ name: 'Threads' })
export class Thread {
  @PrimaryGeneratedColumn({ name: 'Id', type: 'bigint' })
  id: string

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
  isDisabled: boolean

  @Column('varchar', {
    name: 'Title',
    length: 150,
    nullable: false,
  })
  title: string

  @Column('varchar', {
    name: 'Body',
    length: 2500,
    nullable: true,
  })
  @Length(10, 2500)
  body: string
}
