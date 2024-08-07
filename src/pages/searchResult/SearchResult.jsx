import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InfiniteScroll from "react-infinite-scroll-component";

import "./style.scss";

import { fetchDataFromApi } from "../../utils/api";
import ContentWrapper from "../../components/contentWrapper/ContentWrapper";
import MovieCard from "../../components/movieCard/MovieCard";
import Spinner from "../../components/spinner/Spinner";
import noResults from "../../assets/no-results.png";

const SearchResult = () => {
    const [data, setData] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { query } = useParams();
    const navigate = useNavigate();

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching data for query:", query);
            const res = await fetchDataFromApi(`/search/multi`, { query, page: pageNum, include_adult: false, language: "en-US" });
            console.log("API Response:", res);
            setData(res);
            setPageNum(prev => prev + 1);
        } catch (err) {
            console.error("Fetch error:", err);
            setError("Failed to fetch data");
        } finally {
            setLoading(false);
        }
    };

    const fetchNextPageData = async () => {
        setLoading(true);
        try {
            console.log("Fetching next page for query:", query);
            const res = await fetchDataFromApi(`/search/multi`, { query, page: pageNum, include_adult: false, language: "en-US" });
            console.log("Next Page Response:", res);
            setData(prev => ({
                ...prev,
                results: [...(prev?.results || []), ...res.results],
            }));
            setPageNum(prev => prev + 1);
        } catch (err) {
            console.error("Fetch next page error:", err);
            setError("Failed to fetch more data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log("Query changed:", query);
        setPageNum(1);
        fetchInitialData();
    }, [query]);

    const handleSearch = (event) => {
        if (event.key === "Enter" && event.target.value.trim()) {
            navigate(`/search/${event.target.value}`);
        }
    };

    return (
        <div className="searchResultsPage">
            {loading && <Spinner initial={true} />}
            {error && <div className="error">{error}</div>}
            {!loading && !error && (
                <ContentWrapper>
                    {data?.results?.length > 0 ? (
                        <>
                            <div className="pageTitle">
                                {`Search ${
                                    data?.total_results > 1
                                        ? "results"
                                        : "result"
                                } of '${query}'`}
                            </div>
                            <InfiniteScroll
                                className="content"
                                dataLength={data?.results?.length || 0}
                                next={fetchNextPageData}
                                hasMore={pageNum <= data?.total_pages}
                                loader={<Spinner />}
                                endMessage={
                                    <p style={{ textAlign: "center" }}>
                                        <b>You have seen it all!</b>
                                    </p>
                                }
                            >
                                {data?.results.map((item) => {
                                    if (item.media_type === "person") return null;
                                    return (
                                        <MovieCard
                                            key={item.id}
                                            data={item}
                                            fromSearch={true}
                                        />
                                    );
                                })}
                            </InfiniteScroll>
                        </>
                    ) : (
                        <div className="resultNotFound">
                            <img src={noResults} alt="No Results" />
                            <p>Sorry, Results not found!</p>
                        </div>
                    )}
                </ContentWrapper>
            )}
        </div>
    );
};

export default SearchResult;
