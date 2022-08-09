import React from 'react';
import SideMenu from '../components/SideMenu';
import './VideoPage.css'
import { getHomeVideos, getSingleVideo } from '../fetcher'
import HeaderBar from '../components/HeaderBar';
import Grid from '../components/Grid';
import VideoThumbnail from '../components/VideoThumbnail';
import { useParams } from 'react-router-dom';
import { Chart } from "react-google-charts";
import { useState } from 'react';

import {
  Table,
  Select
} from 'antd'

const { Column, ColumnGroup } = Table;
const { Option } = Select;
const columns = [
  { type: "string", label: "Task ID" },
  { type: "string", label: "Task Name" },
  { type: "string", label: "Resource" },
  { type: "date", label: "Start Date" },
  { type: "date", label: "End Date" },
  { type: "number", label: "Duration" },
  { type: "number", label: "Percent Complete" },
  { type: "string", label: "Dependencies" },
];
const year = this.state.videoInfo.map(info => info.trend_start.substring(0,4)); 
const rows = [
  [
    "TimePeriod",
    "Time Period",
    "time",
    new Date(year, 2, 22),
    new Date(2013, 5, 20),
    null,
    100,
    null,
  ]
];
const data = [columns, ...rows];


const options = {
  height: 70,
  gantt: {
    trackHeight: 30,
  },
};


class VideoPage extends React.Component {

      state = {
        fullLink: "",
        videoInfo: [],
        videoId: "",
        taskFields: {}
      };
      
      
    fetchVideoId = async () => {
      
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const videoId = urlParams.get("videoid");
      this.state.videoId = videoId;
      var linkBegin = "https://www.youtube.com/embed/";
      this.state.fullLink = linkBegin + `${this.state.videoId}`;
      this.taskFields = {
        id: 'TaskID',
        name: 'TaskName',
        startDate: 'StartDate',
        duration: 'Duration',
        progress: 'Progress',
        child: 'subtasks',
      };
    };
  
    componentDidMount() {
      this.fetchVideoId();
      getSingleVideo(this.state.videoId).then(res => {
        this.setState({ videoInfo: res.results });
        
        
      })
    };
    
    
    render() {
  
      return (
        
        <div>
  
            <div id="page">
    
                <div id="sideBar">
                    <div>
                    <SideMenu />
                    </div>
                </div>
            
                <div className="videoInfo">

                  <iframe id="videoFrame" width="640" height="360" 
                      src={this.state.fullLink}>
                  </iframe>

                  <h2>Title: </h2>
                  {this.state.videoInfo.map(info => <h5>{info.video_title}</h5>)}
                  <h2>Description:</h2>

                  {/* {this.state.videoInfo.map(info => <h5>{info.description}</h5>)} */}
                  
                  {this.state.videoInfo.map(info => <h5>{info.description.substring(0, 150)}</h5>)}
                  <h2>Trending Start Date:</h2>
                  {this.state.videoInfo.map(info => <h5> {info.trend_start.substring(0,10)}</h5>)}
                  <h2>Trending End Date:</h2>
                  {this.state.videoInfo.map(info => <h5> {info.trend_stop.substring(0,10)}</h5>)}
                  <h2>Trending Time:</h2>
                  <Chart chartType="Gantt" data={data} width = "60%" height = "5%" options={options}/>
                  <h2>Countries:</h2>
                  {this.state.videoInfo.map(info => <h5>  {info.countries}</h5>)}
                  
                  <h2>Views:</h2>
                  {this.state.videoInfo.map(info => <h5> {info.views}</h5>)}
                  <h2>Likes:</h2>
                  {this.state.videoInfo.map(info => <h5>{info.likes}</h5>)}
                  
    
                </div>
            
            
            </div>
        </div>
      )
    };
  
  }
  
  export default VideoPage
