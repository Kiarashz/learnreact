import React from 'react'
import User from './User'

export default function Users({users}) {
    if (!users) return null
    return (
        <ul className="users">
            {
                users.map(
                    (user,i) => (
                        <User key={i} {...user} />
                    )
                )            
            }
        </ul>
    )
}