import './global.scss'
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import { toast } from "sonner"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { useState, useEffect, useMemo, useRef } from "react"
import { useQuery } from "@tanstack/react-query";

function Game() {
    const populationPercentCount = 100
    const populationIncreasedCount = 10
    const pickaxeBasePrice = 20

    const [money, setMoney] = useState(100)
    // MATERIALS
    const [pickaxes, setPickaxes] = useState([])
    const [pickaxePrice, setPickaxePrice] = useState(20)
    // MINERALS
    const [minerals, setMinerals] = useState(0)
    const [mineralPrice, setMineralPrice] = useState(10)
    // POPULATION
    const [population, setPopulation] = useState(100)
    const [totalMineralsSold, setTotalMineralsSold] = useState(0)
    const [merchants, setMerchants] = useState(0);
    const [potentialMerchants, setPotentialMerchants] = useState(0)

    const minPrice = 3
    const maxPrice = 20

    const mineralsRef = useRef(minerals)
    const mineralPriceRef = useRef(mineralPrice)
    const demandPercentageRef = useRef(0)
    const potentialBuyersRef = useRef(0)

    useEffect(() => {
        mineralsRef.current = minerals
    }, [minerals])

    useEffect(() => {
        mineralPriceRef.current = mineralPrice
        updateDemandAndBuyers()
    }, [mineralPrice])

    useEffect(() => {
        const chance = Math.min(10 + Math.floor(population / 10), 50);
        if (Math.random() * 100 < chance) {
            setPotentialMerchants(prev => prev + 1);
        }
    }, [population]);

    useEffect(() => {
        const timers = [];

        for (let i = 0; i < merchants; i++) {
            const interval = setInterval(() => {
                if (money >= pickaxePrice) {
                    setMoney(prevMoney => prevMoney - pickaxePrice);
                    setPickaxes(prevPickaxes => [...prevPickaxes, { durability: 5 }]);
                    setPickaxePrice(prevPrice => prevPrice + 5);
                }
            }, 10000);
            timers.push(interval);
        }

        return () => timers.forEach(clearInterval);
    }, [merchants, money, pickaxePrice]);

    useEffect(() => {
        if (merchants === 0 && pickaxePrice > pickaxeBasePrice) {
            const interval = setInterval(() => {
                setPickaxePrice(prevPrice => Math.max(pickaxeBasePrice, prevPrice - 5)); // 5 birim düşüş
            }, 3000);
            return () => clearInterval(interval);
        }
    }, [merchants, pickaxePrice]);

    useEffect(() => {
        updateDemandAndBuyers()
    }, [])

    useEffect(() => {
        if (totalMineralsSold > 0 && totalMineralsSold % populationPercentCount === 0) {
            setPopulation(prevPopulation => prevPopulation + populationIncreasedCount)
        }
    }, [totalMineralsSold])

    useEffect(() => {
        updateDemandAndBuyers()
    }, [population])

    useEffect(() => {
        let intervalId

        const sellMineral = () => {
            if (mineralsRef.current > 0 && potentialBuyersRef.current > 0) {
                setMoney(prevMoney => prevMoney + mineralPriceRef.current)
                setMinerals(prevMinerals => prevMinerals - 1)
                setTotalMineralsSold(prevTotal => prevTotal + 1)

                toast(`1 Mineral Satın Alındı!`)
            }

            intervalId = setTimeout(sellMineral, getSellInterval())
        }

        sellMineral()

        return () => clearTimeout(intervalId)
    }, [])

    const updateDemandAndBuyers = () => {
        const demandPercentage = Math.max(0, 100 - ((mineralPriceRef.current - minPrice) / (maxPrice - minPrice)) * 100)
        demandPercentageRef.current = demandPercentage
        potentialBuyersRef.current = Math.floor((population * demandPercentage) / 100)
    }

    const hireMerchant = () => {
        if (money >= 200 && potentialMerchants > 0) {
            setMoney(prevMoney => prevMoney - 200);
            setMerchants(prevMerchants => prevMerchants + 1);
            setPotentialMerchants(prevPotential => prevPotential - 1);
        }
    }

    const getSellInterval = () => {
        const maxInterval = 10000
        const minInterval = 1000
        const demandPercentage = demandPercentageRef.current
        return Math.max(minInterval, maxInterval - (demandPercentage / 100) * (maxInterval - minInterval))
    }

    const isPickaxeDisabled = useMemo(() => money < 20, [money])
    const buyPickaxe = () => {
        if (money >= 20) {
            setMoney(money - 20)
            setPickaxes([...pickaxes, { durability: 5 }])
        }
    }

    const mineMineral = () => {
        if (pickaxes.length > 0) {
            const newPickaxes = [...pickaxes]
            const currentPickaxe = newPickaxes[0]

            currentPickaxe.durability -= 1

            if (currentPickaxe.durability === 0) {
                newPickaxes.shift()
            }

            setPickaxes(newPickaxes)
            setMinerals(prevMinerals => prevMinerals + 1)
        }
    }

    const increasePrice = () => {
        if (mineralPrice < maxPrice) {
            setMineralPrice(prevPrice => Math.min(maxPrice, prevPrice + 1))
        }
    }

    const decreasePrice = () => {
        if (mineralPrice > minPrice) {
            setMineralPrice(prevPrice => Math.max(minPrice, prevPrice - 1))
        }
    }

    return (
        <div className="GameMain bg-zinc-900 dark:bg-white">
            <h1 className="text-5xl font-extrabold mb-8">MADEN OCAĞI</h1>

            <div className="py-4 text-2xl">
                <span>Kasadaki Para : <strong>{ money }</strong> TL</span>
            </div>

            <div className="py-2 text-1xl">
                <span>Popülasyon : <strong>{ population }</strong> Kişi</span>
            </div>
            <div className="py-2 text-1xl">
                <span>Satın Alınan Maden : <strong>{ totalMineralsSold }</strong> Adet</span>
            </div>
            <div className="py-2 text-1xl">
                <span>Talep : <strong>{ demandPercentageRef.current.toFixed(2) }</strong>%</span>
            </div>
            <div className="py-2 text-1xl">
                <span>Potansiyel Alıcılar : <strong>{ potentialBuyersRef.current }</strong> Kişi</span>
            </div>

            <div className="py-4"></div>

            <div className="py-2 text-1xl">
                <span>
                    <Button variant="outline" onClick={ decreasePrice }>-</Button>
                    <span className="mr-4 ml-4">Mineral Fiyatı: <strong>{ mineralPrice } TL</strong></span>
                    <Button variant="outline" onClick={ increasePrice }>+</Button>
                </span>
            </div>
            <div className="py-2 text-1xl">
                <span>Kazma Adeti : <strong>{ pickaxes.length }</strong> Kişi</span>
                <Button variant="outline" onClick={ buyPickaxe } className="ml-4" disabled={ isPickaxeDisabled }>
                    Kazma Satın Al (20TL)
                </Button>
            </div>
            <div className="py-2 text-1xl">
                <span>Mineral Adeti : <strong>{ minerals }</strong> Adet</span>
                <Button variant="outline" onClick={ mineMineral } className="ml-4" disabled={ pickaxes.length === 0 }>
                    Maden Kaz
                </Button>
            </div>
            <div className="py-2 text-1xl">
                <span>Tüccar : <strong>{ merchants }</strong> Kişi</span>
                <Button variant="outline" onClick={ hireMerchant } className="ml-4" disabled={ pickaxes.length === 0 }>
                    Tüccar Satın Al
                </Button>
            </div>

            <Toaster/>
        </div>
    )
}

export default Game
