import React from "react";
import { PageHeader, SiteWrapper } from "../interface/SiteWrapper";
const ComingSoon = (props)=>{
    return(
        <SiteWrapper>
            <PageHeader title={props.title} />
            <div className="container">
            <div className="empty">
                <div className="empty-title">Coming soon...</div>
            </div>
            </div>
        </SiteWrapper>
    );
}
export default ComingSoon;