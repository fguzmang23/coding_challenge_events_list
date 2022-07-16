import React from 'react'
import styles from './index.module.css'
import PropTypes from 'prop-types'
import { eventsEnum } from '../../constants'

const Event = ({ elem }) => {
    return (
        <div className={styles.container}>
            <div className={styles.circle} />
            <div className={styles.textContainer}>
                <p className={styles.text}>
                    {elem.eventType === eventsEnum.COLONY_ROLE_SET ? (
                        <>
                            <span className={styles.heavy}>${elem.role} </span>
                            role assigned to user{' '}
                            <span className={styles.heavy}>
                                {elem.userAddress}{' '}
                            </span>
                            in domain
                            <span className={styles.heavy}>
                                {' '}
                                ${elem.domainId}
                            </span>
                        </>
                    ) : elem.eventType === eventsEnum.COLONY_INITIALIZED ? (
                        `Congratulations! It\'s a beautiful baby colony!`
                    ) : elem.eventType === eventsEnum.DOMAIN_ADDED ? (
                        <>
                            Domain{' '}
                            <span className={styles.heavy}>
                                {elem.domainId}
                            </span>{' '}
                            added
                        </>
                    ) : elem.eventType === eventsEnum.PAYOUT_CLAIMED ? (
                        <>
                            User{' '}
                            <span className={styles.heavy}>
                                ${elem.userAddress}
                            </span>{' '}
                            claimed{' '}
                            <span className={styles.heavy}>${elem.amount}</span>{' '}
                            payout from pot{' '}
                            <span className={styles.heavy}>
                                ${elem.fundingPotId}
                            </span>
                        </>
                    ) : null}
                </p>
                <p className={styles.date}> DD Mmm</p>
            </div>
        </div>
    )
}

Event.propTypes = {
    text: PropTypes.object,
}

export default Event
