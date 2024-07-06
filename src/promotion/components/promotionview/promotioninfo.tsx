import React,{useState, useEffect} from 'react'
import sample_image_lg from '../../img/sample_image_lg.png'
import location_icon_white from '../../img/location_icon_white.png'
import calendar_icon_white from '../../img/calendar_icon_white.png'
import { ViewPromotion } from '../../types';
import ShowInfo from './showinfo'
import TalkInfo from './talkinfo'
import { convertStringToDate } from '../../../utils/time';
import Loading from '../../../common/loading';
import { SetListMusic } from '../../types';
import { axiosAPI, axiosSemiSecureAPI } from '../../../axios';
import { AxiosError } from 'axios';
import toast from 'react-hot-toast';
type Props = {
  result : ViewPromotion;
  isLoading : boolean;
}

const PromotionInfo = (props: Props) => {

  const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

  const { 
    promotionId,
    title,
    content,
    team,
    entranceFee,
    maxAudience,
    date,
    startTime,
    endTime,
    location,
    refundInfo,
    writer,
    musicList,
    imageList,
    musicLikeList
  } = props.result;

  
  const [likeList, setLikeList] = useState<SetListMusic[]>(musicLikeList);
  const [isLeft, setIsLeft] = React.useState<boolean>(true);

  const fetchData = async () => {
    const musicIdList = musicList.map((music) => music.id);
    
    try {
      const likeCounts = await Promise.all(
        musicIdList.map(async (musicId : number) => {
          const response = await axiosAPI.get(`/api/likes/music/${musicId}/count`);
          if (response.data.isSuccess) {
            return { musicId, likeCount: response.data.result };
          }
          return { musicId, likeCount: 0 };
        })
      );

      const likeStatuses = await Promise.all(
        musicIdList.map(async (musicId) => {
          try {
            const response = await axiosSemiSecureAPI.get(`/api/likes/music/${musicId}`);
            if (response.data.isSuccess) {
              return { musicId, song_like: response.data.result };
            }
            return { musicId, song_like: false };
          } catch (e) {
            //console.log(e)
            return { musicId, song_like: false };
          }
        })
      );

      const newLikeList = musicList.map((music) => {
        const likeCount = likeCounts.find((item) => item.musicId === music.id)?.likeCount || 0;
        const song_like = likeStatuses.find((item) => item.musicId === music.id)?.song_like || false;
        
        return {
          id: music.id,
          song_like_num: likeCount,
          song_like:song_like,
        };
      });

      setLikeList(newLikeList);
    } catch (e:any) {
      //console.log(e)
    }
  };

  const updateHeart = async (id:any, value : boolean) =>{
    if (value) {
      try {
          await toast.promise(
            axiosSemiSecureAPI.delete(`/api/likes/music/${id}`),
            {
              loading: '좋아요 처리중..',
              success: <b>좋아요가 취소되었습니다.</b>,
              error: <b>좋아요를 처리할 수 없습니다.</b>,
            }
        );
      } catch (e) {
        console.log(e);
      }
      finally{
        fetchData();
      }
    }
    else{
      try {
          await toast.promise(
            axiosSemiSecureAPI.post(`/api/likes/music/${id}`),
            {
              loading: '좋아요 처리중..',
              success: <b>좋아요가 완료되었습니다.</b>,
              error: <b>좋아요를 처리할 수 없습니다.</b>,
            }
        );
      } catch (e) {
        console.log(e);
      }finally{
        fetchData();
      }
    }
  }

  useEffect(()=>{
    fetchData();
  },[])

  useEffect(()=>{
    console.log(likeList)
  
  },[likeList])

  const onLeftClick = () => {
    setIsLeft(true);
  };

  const onRightClick = () => {
    setIsLeft(false);
  };

  return (
    props.isLoading ? <Loading isLoading={props.isLoading} text={'정보를 가져오는 중입니다.'}/> :
    <div className='w-full'>
      <img className='mt-18px w-full h-350px object-cover' src={imageList !== undefined ? imageList[0] : sample_image_lg}/>
      <div className='w-full mt-10px mx-6px'>
        <div className='text-plg text-system-white'>{team}</div>
        <div className='text-ptitle font-semibold text-system-white'>{title}</div>
      </div>
      <div className="flex flex-row items-center justify-between">
        <div className="flex flex-col">
          <div className="flex justify-between items-center">
            <div className="flex flex-row items-center">
              <img src={location_icon_white} alt="location" className="w-4 h-4 mr-1"/>
              <div className="text-gray-2 text-psm">{location}</div>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row items-center">
              <img src={calendar_icon_white} alt="calendar" className="w-4 h-4 mr-1"/>
              <div className="text-gray-2 text-psm">{date}</div>
              <div>&nbsp;</div>
              <div className="text-gray-2 text-psm">{WEEKDAY[new Date(date).getDay()]}</div>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row items-center">
              <img src={calendar_icon_white} alt="calendar" className="w-4 h-4 mr-1"/>
              <div className="text-gray-2 text-psm">최대&nbsp;{maxAudience}명</div>
            </div>
          </div>
          <div className="flex flex-row justify-between items-center">
            <div className="flex flex-row items-center">
              <img src={calendar_icon_white} alt="calendar" className="w-4 h-4 mr-1"/>
              <div className="text-gray-2 text-psm">{`${convertStringToDate(startTime)}~`}</div>
              <div className="text-gray-2 text-psm">{convertStringToDate(endTime)}</div>
            </div>
          </div>
        </div>
        <div className="text-ptitle font-semibold text-primary">{`${entranceFee}₩`}</div>
      </div>
      <div className="flex flex-row w-full mt-5 h-10">
        <div onClick={onLeftClick} style={{ background: isLeft ? "#474747" : "#2A2A2A" }} className="rounded-l-xl flex w-1/2 items-center justify-center">
          <div className="text-white text-pmd">공연 정보</div>
        </div>
        <div onClick={onRightClick} style={{ background: !isLeft ? "#474747" : "#2A2A2A" }} className="rounded-r-xl flex w-1/2 items-center justify-center">
          <div className="text-white text-pmd">응원 Talk</div>
        </div>
      </div>
      {
        isLeft ? (
          <ShowInfo
            musicList={musicList}
            content={content}
            refundInfo={refundInfo}
            musicLikeList={likeList}
            updateHeart={updateHeart}
          />
        ) : (
          <TalkInfo
            writer={writer}
            promotionId = {promotionId}/>
        )
      }
    </div>
  );
}

export default PromotionInfo