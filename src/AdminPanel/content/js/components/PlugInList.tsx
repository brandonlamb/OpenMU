﻿import React from "react";
import { connect } from "react-redux";

import { ApplicationState } from "../stores/index";
import { PlugInConfiguration, PlugInExtensionPoint } from "../stores/plugins/types";
import { fetchPlugInConfigurations } from "../stores/plugins/actions";

import PlugInItem from "./PlugInItem";
import PlugInExtensionPointSelection from "./PlugInExtensionPointSelection";
import { showModal } from "content/js/stores/modal/actions";
import { IListProps, ListComponent } from "./ListComponent";

interface IPlugInListState {
    filterName: string;
    filterType: string;
}

interface IPlugInListProps extends IListProps{
    plugins: PlugInConfiguration[];
    extensionPoints: PlugInExtensionPoint[];
    filterName: string;
    filterType: string;
    selectedExtensionPointId: any;
    showCreateDialog: () => void;
    fetchPage(selectedExtensionPointId: any, filterName: string, filterType: string, newPage: number, entriesPerPage: number): Promise<void>;
}

class PlugInList extends ListComponent<IPlugInListProps, IPlugInListState> {
    constructor(props: IPlugInListProps) {
        super(props);
        this.state = { filterName: props.filterName, filterType: props.filterType }
    }


    public componentDidMount() {
        this.props.fetchPage(this.props.selectedExtensionPointId, this.props.filterName, this.props.filterType, this.props.page, this.props.pageSize);
    }

    public render() {
        let pluginList = this.props.plugins.map(
            plugin => <PlugInItem plugin={plugin} key={plugin.id} markedName={this.props.filterName} markedType={this.props.filterType}/>);
        return (
            <div>
                {this.getToolbar()}
                <table className="table table-striped table-hover">
                    <thead>
                        <tr>
                            <th className="col-xs-3">Extension Point</th>
                            <th className="col-xs-3">Plugin Name</th>
                            <th className="col-xs-3">Plugin Type</th>
                            <th className="col-xs-3">Action</th>
                        </tr>
                        <tr>
                            <th className="col-xs-3"><PlugInExtensionPointSelection /></th>
                            <th className="col-xs-3"><input className="btn search" placeholder="Search" value={this.state.filterName} onChange={(event: InputFormEvent) => this.filterByName(event.target.value)}/></th>
                            <th className="col-xs-3"><input className="btn search" placeholder="Search" value={this.state.filterType} onChange={(event: InputFormEvent) => this.filterByType(event.target.value)}/></th>
                            <th className="col-xs-3"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {pluginList}
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><button type="button" className="btn btn-xs btn-success" onClick={this.props.showCreateDialog}>Create</button></td>
                            <td></td>
                            <td></td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        );
    }

    filterByName(filterName: string) {
        this.setState({ filterName: filterName });
        this.props.fetchPage(this.props.selectedExtensionPointId, filterName, this.props.filterType, this.props.page, this.props.pageSize);
    }

    filterByType(filterType: string) {
        this.setState({ filterType: filterType });
        this.props.fetchPage(this.props.selectedExtensionPointId, this.props.filterName, filterType, this.props.page, this.props.pageSize);
    }

    fetchNextPage() {
        this.props.fetchPage(this.props.selectedExtensionPointId, this.props.filterName, this.props.filterType, this.props.page + 1, this.props.pageSize);
    }

    fetchPreviousPage() {
        this.props.fetchPage(this.props.selectedExtensionPointId, this.props.filterName, this.props.filterType, this.props.page - 1, this.props.pageSize);
    }
}


const mapDispatchToProps = (dispatch: any) => {
    return {
        fetchPage: (extensionPoint: any, filterName: string, filterType: string, newPage: number, entriesPerPage: number) => {
            if (newPage > 0) {
                dispatch(fetchPlugInConfigurations(extensionPoint, filterName, filterType, newPage, entriesPerPage));
            }
        },
        showCreateDialog: () => dispatch(showModal((<span>Creating is not supported yet.</span>)))
    };
}

const mapStateToProps = (state: ApplicationState) => {
    return {
        plugins: state.plugInListState.plugins,
        page: state.plugInListState.page,
        pageSize: state.plugInListState.pageSize,
        filterName: state.plugInListState.filterName,
        filterType: state.plugInListState.filterType,
        hasMoreEntries: state.plugInListState.hasMoreEntries,
        extensionPoints: state.plugInListState.extensionPoints,
        selectedExtensionPointId: state.plugInListState.selectedExtensionPointId,
    };
};


export default connect(mapStateToProps, mapDispatchToProps)(PlugInList);