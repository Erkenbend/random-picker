import {JSX, useEffect, useState} from 'react'
import './App.css'


class Roll {
    readonly time: number
    readonly maxChoices: number
    readonly result: number

    constructor(maxChoices: number, result: number) {
        this.time = performance.now() + performance.timeOrigin
        this.maxChoices = maxChoices
        this.result = result
    }
}

interface Bounds {
    readonly min: number
    readonly max: number
}

const config = {
    buttonMinDefault: 2,
    buttonMinLimit: 2,
    buttonMaxDefault: 8,
    buttonMaxLimit: 20,
    maxHistoryLength: 15,
} as const;

function App() {
    const [randomResult, updateRandomResult] = useState<Roll>(new Roll(0, 0))
    const [bounds, setBounds] = useState<Bounds>({min: config.buttonMinDefault, max: config.buttonMaxDefault});
    const [buttons, setButtons] = useState<JSX.Element[]>(generateButtons(config.buttonMinDefault, config.buttonMaxDefault));
    const [history, setHistory] = useState<Roll[]>([]);

    useEffect(updateHistoryOnNewResult, [randomResult])

    function updateHistoryOnNewResult() {
        if (randomResult.result != 0) {
            setHistory(h => {
                const newH = [...h];
                if (h.length >= config.maxHistoryLength) {
                    newH.splice(0, 1)
                }
                newH.push(randomResult);
                return newH;
            })
        }
    }

    function incrementRightSide() {
        const buttonLabel = bounds.max + 1;
        const button = generateButton(buttonLabel);
        setButtons(b => [...b, button]);
        setBounds(b => ({min: b.min, max: buttonLabel}));
    }

    function decrementRightSide() {
        setButtons(b => b.slice(0, -1));
        setBounds(b => ({min: b.min, max: b.max - 1}));
    }

    function incrementLeftSide() {
        const buttonLabel = bounds.min - 1;
        const button = generateButton(buttonLabel);
        setButtons(b => [button, ...b]);
        setBounds(b => ({min: buttonLabel, max: b.max}));
    }

    function decrementLeftSide() {
        setButtons(b => b.slice(1, b.length))
        setBounds(b => ({min: b.min + 1, max: b.max}));
    }

    function generateButtons(min: number, max: number): JSX.Element[] {
        const result = []
        for (let i = min; i <= max; i++) {
            result.push(generateButton(i))
        }
        return result
    }

    function generateButton(label: number): JSX.Element {
        return <button type="button" onClick={() => {
            updateRandomResult(() => new Roll(label, Math.ceil(Math.random() * label)));
        }} key={label}>{label}</button>
    }

    return (
        <>
            <div className="history">
                <h3 className="history-title">History</h3>
                {history.map(elem => <span className="history-element"
                                           key={elem.time}>{new Date(elem.time).toLocaleTimeString("en-DE")}&emsp;{elem.maxChoices} → {elem.result}</span>).reverse()}
            </div>
            <div className="instructions">
                <div className="size-changer">
                    <button type="button" onClick={incrementLeftSide} disabled={bounds.min <= config.buttonMinLimit}>+
                    </button>
                    <button type="button" onClick={decrementLeftSide} disabled={bounds.min == bounds.max}>-</button>
                </div>
                <div className="instructions-text">
                    Click on a button to randomly choose among that amount of options
                </div>
                <div className="size-changer">
                    <button type="button" onClick={decrementRightSide} disabled={bounds.min == bounds.max}>-</button>
                    <button type="button" onClick={incrementRightSide} disabled={bounds.max >= config.buttonMaxLimit}>+
                    </button>
                </div>
            </div>
            <div className="button-list">
                {buttons}
            </div>
            <h1 className="result-card">
                <span className="result-text">Pick option </span><span
                className="random-result">{randomResult.result == 0 ? "-" : randomResult.result}</span>
            </h1>
            <div className="secret">Theo stinkt lul</div>
        </>
    )
}

export default App
