import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { injectIntl } from 'react-intl';
import './PostRecommendation.less';
import { getUserFeedContent } from '../../feed/feedActions';
import Loading from '../../components/Icon/Loading';

@injectIntl
@withRouter
@connect(null, { getUserFeedContent })
class PostRecommendation extends Component {
  static propTypes = {
    getUserFeedContent: PropTypes.func.isRequired,
    location: PropTypes.shape().isRequired,
    intl: PropTypes.shape().isRequired,
    history: PropTypes.shape().isRequired,
  };

  state = {
    recommendedPosts: [],
    loading: false,
  };

  componentWillMount() {
    const { location } = this.props;
    if (location.pathname !== '/') {
      const username = location.pathname.split('/')[2].replace('@', '');
      this.setState({
        loading: true,
      });
      this.props
        .getUserFeedContent({
          sortBy: 'blog',
          username,
          limit: 4,
        })
        .then((result) => {
          const recommendedPosts = Array.isArray(result.payload.postsData)
            ? result.payload.postsData
            : [];
          this.setState({
            recommendedPosts,
            loading: false,
          });
        });
    }
  }

  getFilteredPosts = () => {
    const currentPostPermlink = window.location.pathname.split('/')[3];
    return this.state.recommendedPosts
      .filter(post => post.permlink !== currentPostPermlink)
      .slice(0, 3);
  };

  navigateToPost = (category, author, permlink) => {
    this.props.history.push(`/${category}/@${author}/${permlink}`);
    window.scrollTo(0, 0);
    this.setState(this.state);
  };

  renderPosts = () => {
    const { intl } = this.props;
    const filteredRecommendedPosts = this.getFilteredPosts();

    return filteredRecommendedPosts.map((post) => {
      const commentsText = post.children === 1
        ? intl.formatMessage({ id: 'comment', defaultMessage: 'Comment' })
        : intl.formatMessage({ id: 'comments', defaultMessage: 'Comments' });
      return (
        <div className="PostRecommendation__link" key={post.id}>
          <a
            role="presentation"
            onClick={() => this.navigateToPost(post.category, post.author, post.permlink)}
            className="PostRecommendation__link-title"
          >
            {post.title}
          </a>
          <br />
          {intl.formatMessage({ id: 'by', defaultMessage: 'By' })}
          {' '}
          <Link role="presentation" to={`/@${post.author}`}>{post.author}</Link>
          <br />
          {post.children > 0 &&
            <Link to={`/${post.category}/@${post.author}/${post.permlink}#comments`}>
              {post.children}
              {' '}
              {commentsText}
            </Link>}
        </div>
      );
    });
  };

  render() {
    const { intl } = this.props;
    const { loading } = this.state;
    const filteredRecommendedPosts = this.getFilteredPosts();

    if (loading) {
      return <Loading />;
    }

    if (filteredRecommendedPosts.length === 0) {
      return <div />;
    }

    return (
      <div className="PostRecommendation">
        <h4 className="PostRecommendation__title SidebarBlock__content-title">
          <i className="iconfont icon-headlines PostRecommendation__icon" />
          {' '}
          {intl.formatMessage({ id: 'recommended_posts', defaultMessage: 'Recommended Posts' })}
        </h4>
        {this.renderPosts()}
      </div>
    );
  }
}

export default PostRecommendation;
