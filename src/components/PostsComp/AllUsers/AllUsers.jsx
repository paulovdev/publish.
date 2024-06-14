import React from 'react';
import { useQuery, useQueryClient } from 'react-query';
import { getDocs, collection, query } from 'firebase/firestore';
import { db } from '../../../firebase/Firebase';
import FollowButton from '../../FollowButton/FollowButton';
import { LiaRandomSolid } from "react-icons/lia";
import Skeleton from 'react-loading-skeleton';
import { Link } from 'react-router-dom';

import "./AllUsers.scss";

const shuffleArray = array => {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
};

const AllUsers = () => {
    const queryClient = useQueryClient();
    const { isLoading, data: users = [] } = useQuery('randomUsers', async () => {
        const usersSnapshot = await getDocs(query(collection(db, 'users')));
        const shuffledUsers = shuffleArray(usersSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
        })));
        return shuffledUsers.slice(0, 10);
    });

    const loadMoreUsers = () => {
        queryClient.invalidateQueries('randomUsers');
    };

    return (
        <div id='all-users'>
            <div className="user-text">
                <h2>Quem seguir</h2>
            </div>

            {isLoading && (<Skeleton width={160} height={40} />)}
            <button onClick={loadMoreUsers}><LiaRandomSolid size={24} color='#fff' /></button>

            {!isLoading && users.map(user => (
                <div className='all-user-container' key={user.id}>

                    <div className="user-info">
                        <Link to={`/profile/${user.id}`}>
                            {user.profilePicture && (
                                <img src={user.profilePicture} width={100} alt="User" className="user-photo" />
                            )}
                            <p>{user.name}</p>
                        </Link>
                        <FollowButton userId={user.id} />
                    </div>


                </div>
            ))}

        </div>
    );
};

export default AllUsers;
