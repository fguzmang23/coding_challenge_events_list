import React, { useEffect, useState } from 'react'
import styles from './index.module.css'
import { getLogs, ColonyRole, getBlockTime } from '@colony/colony-js'
import getColonyClient from '../../services/colonyClient.js'
import { InfuraProvider } from 'ethers/providers'
import EventsList from '../../components/EventsList/index'
import { eventsEnum } from '../../constants'

const HomePage = () => {
    const provider = new InfuraProvider()
    const [colonyRoleSetData, setColonyRoleSetData] = useState([])
    const [colonyInitializedData, setColonyInitializedData] = useState(0)
    const [domainAddedData, setDomainAddedData] = useState([])
    const [payoutClaimedData, setPayoutClaimedData] = useState([])

    // it sometimes surpasses the allowed requests per second of: 5rps
    // which with the function below, in theory, should not surpass that at any time
    const getPayOutClaimedUserAddresses = async () => {
        const colonyClient = await getColonyClient()
        // enclose all of the getFundingPot calls into an array and then call promise.All
        const daResult = await Promise.all(
            payoutClaimedData.map(async (elem) => {
                return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        const result = await colonyClient.getFundingPot(
                            elem.fundingPotId
                        )
                        resolve(result)
                    })
                })
            })
        )

        const daResult2 = await Promise.all(
            daResult.map((elem) => {
                return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        const result = await colonyClient.getPayment(
                            elem.associatedTypeId
                        )
                        resolve(result)
                    }, 220)
                })
            })
        )
        const newPayoutClaimedData = []
        if (daResult2.length === payoutClaimedData.length) {
            payoutClaimedData.forEach((elem, index) => {
                newPayoutClaimedData.push({
                    ...elem,
                    userAddress: daResult2[index].recipient,
                })
            })
            setPayoutClaimedData(newPayoutClaimedData)
        }
    }

    // NOT IMPLEMENTED, NOT COMPLETED: missing updating the state vars
    // project ID request rate exceeded
    // it sometimes surpasses the allowed requests per second of: 5rps
    // which with the function below, in theory, should not surpass that at any time
    const getBlockTimes = async () => {
        const colonyRoleSetDataTime = await Promise.all(
            colonyRoleSetData.map((elem) => {
                return new Promise((resolve, reject) => {
                    setTimeout(async () => {
                        const result = getBlockTime(provider, elem.blockHash)
                        resolve(result)
                    })
                })
            })
        )
    }

    const getData = async () => {
        const colonyClient = await getColonyClient()
        const colonyRolesetEventFilter = colonyClient.filters.ColonyRoleSet()
        const eventLogs1 = await getLogs(colonyClient, colonyRolesetEventFilter)
        const parsedLogs1 = eventLogs1.map((event) =>
            colonyClient.interface.parseLog(event)
        )

        setColonyRoleSetData(
            parsedLogs1.map((elem, index) => ({
                eventType: eventsEnum.COLONY_ROLE_SET,
                userAddress: elem.values[0],
                domainId: parseInt(elem.values[1]._hex),
                role: ColonyRole[elem.values[2]],
                blockHash: eventLogs1[index].blockHash,
            }))
        )

        const colonyInitializedEventFilter =
            colonyClient.filters.ColonyInitialised()
        const eventLogs2 = await getLogs(
            colonyClient,
            colonyInitializedEventFilter
        )
        setColonyInitializedData(
            eventLogs2.map((elem) => ({
                ...elem,
                eventType: eventsEnum.COLONY_INITIALIZED,
            }))
        )

        const domainAddedEventFilter = colonyClient.filters.DomainAdded()
        const eventLogs3 = await getLogs(colonyClient, domainAddedEventFilter)

        const parsedLogs3 = eventLogs3.map((event) =>
            colonyClient.interface.parseLog(event)
        )

        setDomainAddedData(
            parsedLogs3.map((elem, index) => ({
                eventType: eventsEnum.DOMAIN_ADDED,
                domainId: parseInt(elem.values[0]),
                blockHash: eventLogs3[index].blockHash,
            }))
        )

        const payoutClaimedEventFilter = colonyClient.filters.PayoutClaimed()
        const eventsLogs4 = await getLogs(
            colonyClient,
            payoutClaimedEventFilter
        )

        const parsedLogs4 = eventsLogs4.map((event) =>
            colonyClient.interface.parseLog(event)
        )
        setPayoutClaimedData(
            await Promise.all(
                parsedLogs4.map(async (elem, index) => {
                    return {
                        eventType: eventsEnum.PAYOUT_CLAIMED,
                        fundingPotId: parseInt(elem.values[0]._hex),
                        amount: elem.values[2]._hex,
                        userAddress: 'NA',
                        blockHash: eventsLogs4[index].blockHash,
                    }
                })
            )
        )

        // getBlockTimes()
    }

    useEffect(() => {
        getData()
    }, [])

    useEffect(() => {
        if (payoutClaimedData.length > 0) {
            getPayOutClaimedUserAddresses()
        }
    }, [payoutClaimedData])

    return (
        <div className={styles.container}>
            <EventsList
                Events={[
                    ...(colonyRoleSetData.length > 0
                        ? [...colonyRoleSetData]
                        : []),
                    ...(colonyInitializedData.length > 0
                        ? [...colonyInitializedData]
                        : []),
                    ...(domainAddedData.length > 0 ? [...domainAddedData] : []),
                    ...(payoutClaimedData.length > 0
                        ? [...payoutClaimedData]
                        : []),
                ]}
            />
        </div>
    )
}

export default HomePage
