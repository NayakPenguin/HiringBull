// @ts-nocheck
"use client";
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'next/navigation';
import { CircularProgress } from '@mui/material';
const logo = '/logo.png';
const logoBig = '/logo-big.png';
const membershipGoldCoin = '/membership-gold-coin.gif';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FileCopyOutlinedIcon from '@mui/icons-material/FileCopyOutlined';

const Membership = () => {
    const { userEmail } = useParams() as { userEmail: string }
    const [isLoading, setIsLoading] = useState(true) // default - true 
    const [isVerified, setIsVerified] = useState(null) // default - null
    const [name, setName] = useState('')

    useEffect(() => {
        let mounted = true;

        setIsLoading(true);
        setIsVerified(null);
        setName('')

        const simulateApiCall = () =>
            new Promise((resolve) => {
                setTimeout(() => {
                    // dummy response; replace with real API call
                    resolve({ isVerified: true, name: 'Atanu Nayak' })
                }, 0)
            })

        simulateApiCall().then((res) => {
            if (!mounted) return
            setIsVerified(Boolean(res.isVerified))
            setName(res.name || '')
            setIsLoading(false)
        })

        return () => {
            mounted = false
        }
    }, [userEmail]);

    if (isLoading) {
        return (
            <Container>
                <div className="info"><CircularProgress /> Checking <b>{userEmail}</b> Membership <img src={logo} alt="" /></div>
            </Container>
        )
    }

    if (isVerified) {
        return (
            <Container>
                <div className="left">
                    <h1 className='title'>Help your friends get hired faster</h1>
                    <p className="desc">
                        Invite people you know to HiringBull. <br />
                        <b>When they subscribe, you earn 25% of the plan value as credits — automatically.</b>
                    </p>
                    <div className="referral-card">

                    </div>

                </div>
                <div className="right">
                    <img className="gold-coin" src={membershipGoldCoin} alt="" />
                    <h1>Welcome to HiringBull, Atanu Nayak!</h1>
                    <h2>Your HiringBull membership is active, and we’ll continue sending you early job alerts as new verified opportunities appear — so you can apply before the rush and stay focused on what matters. If you ever face any issues or have questions, feel free to reach out to us at <br /> <b>team@hiringbull.in</b> - We’re here to help.</h2>
                    <div className="membership-details">
                        <div className="joined-date">
                            <span>Member since</span>
                            15 January, 2026
                            <span>60 Days Plan • Expires on 16 March 2026 </span>
                        </div>
                        <div className="membership-type">
                            <img src={logo} alt="" />
                        </div>
                    </div>
                    <div className="options">
                        <a href='/' className="option">
                            <p>Extend Membership - <span>50% Off</span></p>
                            <ChevronRightIcon />
                        </a>
                        <a href='/' className="option">
                            <p>Refer your Friend - <span>nayak.primary@gmail.com</span></p>
                            <ChevronRightIcon />
                        </a>
                    </div>
                </div>
            </Container>
        )
    }

    return (
        <Container>
            <div className="info">Membership not verified for {userEmail}</div>
        </Container>
    )
}

export default Membership


const Container = styled.div`
    height: 100vh;
    width: 100vw;

    display: flex;

    position: relative;

    h1{
        font-size: 2rem;
        font-weight: 500;
        text-align: center;
        margin-bottom: 10px; 
        margin-top: 30px;

        /* background-color: #f0f0f0; */
        
        display: flex;
        align-items: center;
        gap: 12px;

        img{
        height: 60px;
        }
    }

    h2{
        font-size: 1rem;
        font-weight: 300;
        margin-bottom: 16px;

        text-align: center;

        b{
            font-weight: 500;
            /* font-size: 0.9rem; */
            /* letter-spacing: 0.05rem; */
            /* background-color: #eeeeee; */
            /* border: 1px solid #d3cece; */
            /* border-radius: 10px; */
            /* padding: 2.5px 5px; */
        }
    }

    .info{
        position: absolute; 
        width: 100%;
        text-align: center;
        padding: 20px;
        font-size: 0.85rem;
        font-weight: 200;

        display: flex;
        align-items: center;
        justify-content: center;

        b{
            font-weight: 500;
            margin: 0 5px;
        }

        img{
            height: 40px;
            margin-left: 15px;
        }

        .MuiCircularProgress-root{
            margin-right: 20px;
        }
    }

    .left{
        height: 100vh;
        width: 400px;
        background-color: black;
        
        padding: 20px;

        .title{
            margin: 0;
            font-size: 1.5rem;
            text-align: left;
            color: #7bf7aa;
        }

        .desc{
            font-size: 0.85rem;
            font-weight: 300;

            color: #e2dcdc;

            b{
                color: white;
                font-weight: 500;
            }
        }

        .referral-card{
            height: 400px;
            width: 100%;
            background-color: #f0fef3;
            border-radius: 10px;
            margin-top: 20px;
            border: 2px solid white;
        }
    }

    .right{
        padding: 60px 120px;
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;

        .gold-coin{
            height: 150px;
        }

        .membership-details{
            width: 100%;
            max-width: 500px;
            display: flex;
            align-items: center; 
            justify-content: space-between;

            margin-top: 40px;

            width: 100%;

            background-color: #b0fbbe30;
            box-shadow: 0 0 8px rgba(0, 0, 0, 0.2);
            border: 2px solid black;
            border-radius: 10px;

            padding: 20px;

            .joined-date{
                position: relative;
                flex: 1;
                border-right: 1px solid black;
                
                font-size: 1.75rem;
                font-weight: 500;
                
                padding-right: 20px;
                
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: flex-start;
            }

            .membership-type{
                padding-left: 20px;
                display: grid;
                place-items: center;

                img{
                    height: 45px;
                }
            }

            span{
                font-size: 0.7rem;
            }

            &:hover{
                scale: 1.1;
                transition-duration: 250ms;
            }
        }    
        
        .options{
            width: 100%;
            max-width: 500px;

            display: flex;
            flex-direction: column;

            justify-content: flex-start;
            align-items: flex-start;

            .option{
                width: 100%;
                background-color: white;
                box-shadow: 0 0 8px rgba(0, 0, 0, 0.1);
                border: 1px solid #f4eeee;

                padding: 10px;
                border-radius: 10px;

                margin-top: 20px;
                font-size: 0.85rem;
                font-weight: 500;

                cursor: pointer;

                display: flex;
                align-items: center;
                justify-content: space-between;

                text-decoration: none;

                span{
                    font-family: 'Inter', system-ui, sans-serif;
                    font-feature-settings: "tnum";
                    font-variant-numeric: tabular-nums;

                    font-weight: 700;
                    font-style: italic;
                }

                &:hover{
                    border: 1px solid black;
                    transition-duration: 250ms;
                    background-color: #b0fbbe30;
                }
            }
        }
    }
`