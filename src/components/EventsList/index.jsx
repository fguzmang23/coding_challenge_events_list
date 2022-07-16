import React from 'react'
import Event from '../Event/index'
import styles from './index.module.css'
import PropTypes from 'prop-types'

const EventsList = ({ Events }) => {
    return (
        <div className={styles.container}>
            {Events.map((elem) => (
                <Event elem={elem} />
            ))}
        </div>
    )
}

EventsList.propTypes = {
    Events: PropTypes.array,
}

export default EventsList
